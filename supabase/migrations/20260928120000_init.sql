-- The Analog Circle schema. Mirrors the Firestore layout and firestore.rules.
--
-- Members are created by admins before they ever sign in, so a member id is not
-- an auth user id. public.claim_member() links an auth user to the member with
-- the same verified email on first sign-in (public.accounts); every policy
-- resolves the caller's member id through that link.

create schema if not exists private;

-- ---------------------------------------------------------------- tables

create table public.members (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  email text not null unique check (email = lower(email)),
  photo_url text,
  bio text,
  phone text,
  whatsapp_url text,
  social text,
  birthday date,
  role text not null default 'member' check (role in ('member', 'admin')),
  joined_at timestamptz not null default now(),
  birthday_post boolean not null default true
);

create table public.accounts (
  uid uuid primary key references auth.users on delete cascade,
  member_id text not null unique references public.members on delete cascade
);

create table public.circles (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('inner', 'interest', 'location')),
  name text not null,
  description text not null default '',
  number integer,
  image_url text,
  created_by text not null,
  created_at timestamptz not null default now(),
  member_ids text[] not null default '{}'
);

create table public.posts (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('event', 'post', 'birthday', 'offer', 'need')),
  title text not null,
  body text not null default '',
  image_url text,
  author_id text not null,
  published_to text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  pinned boolean not null default false,
  reactions jsonb not null default '{}',
  comment_count integer not null default 0,
  event jsonb,
  celebrant_id text
);

create table public.comments (
  id text primary key default gen_random_uuid()::text,
  post_id text not null references public.posts on delete cascade,
  parent_id text references public.comments on delete cascade,
  author_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  reactions jsonb not null default '{}'
);
create index comments_post_id_idx on public.comments (post_id);
create index comments_parent_id_idx on public.comments (parent_id);

create table public.rsvps (
  post_id text not null references public.posts on delete cascade,
  member_id text not null references public.members on delete cascade,
  status text not null check (status in ('going', 'declined')),
  updated_at timestamptz not null default now(),
  primary key (post_id, member_id)
);
create index rsvps_member_id_idx on public.rsvps (member_id);

create table public.prefs (
  member_id text primary key references public.members on delete cascade,
  channel text not null default 'both' check (channel in ('both', 'push', 'email')),
  notifications jsonb not null default '{}',
  favourite_post_ids text[] not null default '{}'
);

create table public.activity (
  id text primary key default gen_random_uuid()::text,
  type text not null check (type in ('post_created', 'comment', 'reply', 'member_joined')),
  actor_id text not null,
  subject_id text,
  target_route text not null,
  created_at timestamptz not null default now(),
  read_by text[] not null default '{}'
);

create table public.feedback (
  id text primary key default gen_random_uuid()::text,
  author_id text not null,
  body text not null check (length(btrim(body)) > 0),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
-- Security definer so policies can read accounts/members without recursing
-- into their own RLS. Kept in a schema the Data API does not expose.

create function private.me() returns text
language sql stable security definer set search_path = '' as $$
  select member_id from public.accounts where uid = auth.uid()
$$;

create function private.is_member() returns boolean
language sql stable security definer set search_path = '' as $$
  select private.me() is not null
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.members where id = private.me() and role = 'admin')
$$;

/** Signed-in end users. The service role (seed script) and SQL sessions are exempt from column guards. */
create function private.is_end_user() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt() ->> 'role', '') = 'authenticated'
$$;

/** Same rule as lib/reactions.toggleReaction, applied in one locked row update. */
create function private.toggle_reaction(reactions jsonb, emoji text, member text) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare
  ids jsonb := coalesce(reactions -> emoji, '[]'::jsonb);
begin
  if ids ? member then
    select coalesce(jsonb_agg(e), '[]'::jsonb) into ids
    from jsonb_array_elements(ids) e where e <> to_jsonb(member);
  else
    ids := ids || to_jsonb(member);
  end if;
  return case when jsonb_array_length(ids) = 0 then reactions - emoji else jsonb_set(reactions, array[emoji], ids) end;
end
$$;

grant usage on schema private to authenticated;

-- ---------------------------------------------------------------- triggers

-- Members edit their own profile but cannot change their role or sign-in email.
create function private.guard_member() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_end_user() and not private.is_admin()
    and (new.role, new.email, new.joined_at, new.id) is distinct from (old.role, old.email, old.joined_at, old.id) then
    raise exception 'Members cannot change role, email or join date';
  end if;
  return new;
end
$$;
create trigger guard_member before update on public.members for each row execute function private.guard_member();

-- Deleting a member removes them from every circle.
create function private.remove_member_from_circles() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.circles set member_ids = array_remove(member_ids, old.id) where old.id = any (member_ids);
  return old;
end
$$;
create trigger remove_member_from_circles after delete on public.members
  for each row execute function private.remove_member_from_circles();

-- Creators edit their circle except type/creator; others only join or leave a non-inner circle themselves.
create function private.guard_circle() returns trigger
language plpgsql set search_path = '' as $$
declare
  me text := private.me();
  added text[] := array(select unnest(new.member_ids) except select unnest(old.member_ids));
  removed text[] := array(select unnest(old.member_ids) except select unnest(new.member_ids));
  self_only boolean := coalesce((added = array[me] and removed = '{}') or (removed = array[me] and added = '{}'), false);
begin
  if not private.is_end_user() or private.is_admin() then return new; end if;
  if (new.id, new.type, new.created_by, new.created_at) is distinct from (old.id, old.type, old.created_by, old.created_at) then
    raise exception 'Circle type and creator cannot change';
  end if;
  if old.created_by = me then return new; end if;
  if old.type = 'inner' or not self_only
    or (new.name, new.description, new.number, new.image_url) is distinct from (old.name, old.description, old.number, old.image_url) then
    raise exception 'Members may only join or leave a circle themselves';
  end if;
  return new;
end
$$;
create trigger guard_circle before update on public.circles for each row execute function private.guard_circle();

-- Authors edit their post but not who wrote it, its type or when.
-- Reactions go through toggle_post_reaction; comment_count through the comment triggers.
create function private.guard_post() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not private.is_end_user() or private.is_admin() then return new; end if;
  if (new.id, new.author_id, new.type, new.created_at, new.celebrant_id, new.reactions, new.comment_count)
    is distinct from (old.id, old.author_id, old.type, old.created_at, old.celebrant_id, old.reactions, old.comment_count) then
    raise exception 'Post author, type, dates, reactions and comment count cannot change here';
  end if;
  return new;
end
$$;
create trigger guard_post before update on public.posts for each row execute function private.guard_post();

-- Authors edit only a comment's text. Reactions go through toggle_comment_reaction.
create function private.guard_comment() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not private.is_end_user() then return new; end if;
  if (new.id, new.post_id, new.parent_id, new.author_id, new.created_at, new.reactions)
    is distinct from (old.id, old.post_id, old.parent_id, old.author_id, old.created_at, old.reactions) then
    raise exception 'Only a comment''s text can change';
  end if;
  return new;
end
$$;
create trigger guard_comment before update on public.comments for each row execute function private.guard_comment();

-- The post's comment counter follows inserts and deletes (replies cascade, one row each).
create function private.count_comments() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  else
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end
$$;
create trigger count_comments after insert or delete on public.comments
  for each row execute function private.count_comments();

-- ---------------------------------------------------------------- RPCs

/** The caller's member id, linking the auth user to the member with the same verified email on first sign-in. */
create function public.claim_member() returns text
language plpgsql security definer set search_path = '' as $$
declare
  found text := private.me();
  verified_email text;
begin
  if found is not null or auth.uid() is null then return found; end if;
  select lower(email) into verified_email from auth.users where id = auth.uid() and email_confirmed_at is not null;
  select id into found from public.members where email = verified_email;
  if found is not null then
    insert into public.accounts (uid, member_id) values (auth.uid(), found) on conflict do nothing;
    found := private.me();
  end if;
  return found;
end
$$;

create function public.toggle_post_reaction(post_id text, emoji text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_member() then raise exception 'Not a member'; end if;
  update public.posts set reactions = private.toggle_reaction(reactions, emoji, private.me()) where id = post_id;
end
$$;

create function public.toggle_comment_reaction(comment_id text, emoji text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_member() then raise exception 'Not a member'; end if;
  update public.comments set reactions = private.toggle_reaction(reactions, emoji, private.me()) where id = comment_id;
end
$$;

/** Marks one activity read for the caller, or all of it when activity_id is null. */
create function public.mark_activity_read(activity_id text default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  me text := private.me();
begin
  if me is null then raise exception 'Not a member'; end if;
  update public.activity set read_by = array_append(read_by, me)
  where (activity_id is null or id = activity_id) and not (me = any (read_by));
end
$$;

revoke execute on function public.claim_member, public.toggle_post_reaction, public.toggle_comment_reaction,
  public.mark_activity_read from public, anon;
grant execute on function public.claim_member, public.toggle_post_reaction, public.toggle_comment_reaction,
  public.mark_activity_read to authenticated;

-- ---------------------------------------------------------------- RLS

-- Explicit Data API grants; RLS below decides which rows.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

alter table public.members enable row level security;
alter table public.accounts enable row level security;
alter table public.circles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.rsvps enable row level security;
alter table public.prefs enable row level security;
alter table public.activity enable row level security;
alter table public.feedback enable row level security;

create policy "members read" on public.members for select to authenticated using (private.is_member());
create policy "admins add members" on public.members for insert to authenticated with check (private.is_admin());
create policy "own profile or admin" on public.members for update to authenticated
  using (private.is_admin() or id = private.me()) with check (private.is_admin() or id = private.me());
create policy "admins delete members" on public.members for delete to authenticated using (private.is_admin());

create policy "own account" on public.accounts for select to authenticated using (uid = auth.uid() or private.is_admin());
create policy "admins unlink" on public.accounts for delete to authenticated using (private.is_admin());

create policy "circles read" on public.circles for select to authenticated using (private.is_member());
create policy "create circle" on public.circles for insert to authenticated with check (
  private.is_admin()
  or (private.is_member() and type <> 'inner' and created_by = private.me() and member_ids = array[private.me()]));
create policy "edit circle" on public.circles for update to authenticated
  using (private.is_admin() or (private.is_member() and (created_by = private.me() or type <> 'inner')));
create policy "admins delete circles" on public.circles for delete to authenticated using (private.is_admin());

create policy "posts read" on public.posts for select to authenticated using (private.is_member());
create policy "create post" on public.posts for insert to authenticated with check (
  private.is_member() and (
    (type in ('event', 'post') and author_id = private.me())
    -- Automated birthday posts: any member may write today's deterministic post.
    or (type = 'birthday' and author_id = celebrant_id and id ~ ('^birthday-' || celebrant_id || '-[0-9]{4}$'))));
create policy "edit post" on public.posts for update to authenticated
  using (private.is_admin() or (author_id = private.me() and type <> 'birthday'));
create policy "delete post" on public.posts for delete to authenticated
  using (private.is_admin() or author_id = private.me());

create policy "comments read" on public.comments for select to authenticated using (private.is_member());
create policy "create comment" on public.comments for insert to authenticated with check (author_id = private.me());
create policy "edit own comment" on public.comments for update to authenticated using (author_id = private.me());
create policy "delete comment" on public.comments for delete to authenticated using (
  private.is_admin()
  or author_id = private.me()
  or exists (select 1 from public.comments p where p.id = comments.parent_id and p.author_id = private.me())
  or exists (select 1 from public.posts p where p.id = comments.post_id and p.author_id = private.me()));

create policy "rsvps read" on public.rsvps for select to authenticated using (private.is_member());
create policy "rsvp as self" on public.rsvps for insert to authenticated with check (member_id = private.me());
create policy "change own rsvp" on public.rsvps for update to authenticated
  using (member_id = private.me()) with check (member_id = private.me());
create policy "delete rsvp" on public.rsvps for delete to authenticated using (
  private.is_admin() or member_id = private.me()
  or exists (select 1 from public.posts p where p.id = rsvps.post_id and p.author_id = private.me()));

-- Private: settings and favourites are the member's alone.
create policy "own prefs" on public.prefs for select to authenticated using (member_id = private.me());
create policy "create own prefs" on public.prefs for insert to authenticated with check (member_id = private.me());
create policy "edit own prefs" on public.prefs for update to authenticated
  using (member_id = private.me()) with check (member_id = private.me());
create policy "admins delete prefs" on public.prefs for delete to authenticated using (private.is_admin());

create policy "admins read feedback" on public.feedback for select to authenticated using (private.is_admin());
create policy "send feedback" on public.feedback for insert to authenticated with check (author_id = private.me());
create policy "admins delete feedback" on public.feedback for delete to authenticated using (private.is_admin());

-- Read state changes only through mark_activity_read.
create policy "activity read" on public.activity for select to authenticated using (private.is_member());
create policy "log activity" on public.activity for insert to authenticated
  with check (private.is_admin() or actor_id = private.me());

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/*'])
on conflict (id) do nothing;

-- Members upload under their own auth uid folder; the bucket is public for reading.
create policy "members upload images" on storage.objects for insert to authenticated with check (
  bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text and private.is_member());
