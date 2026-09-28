import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, MoreHorizontal, Plus } from "lucide-react";
import { Avatar, Button, Eyebrow, Fab, IconButton, TypeTag, useToast } from "@analog/ui";
import { useCircles, useMe, useMembers, usePosts, useSetCircleMembership } from "../../data/hooks";
import type { Member, Post } from "../../data/types";
import { BackLink } from "../../components/BackLink";
import { EmptyState } from "../../components/EmptyState";
import { CircleFormSheet } from "../../features/circles/CircleFormSheet";
import { CircleTree } from "../../features/circles/CircleTree";
import { circleTag, memberCount } from "../../lib/circles";
import { PostFilterSheet } from "../../features/feed/PostFilterSheet";
import { PostList } from "../../features/feed/PostList";
import { POST_SORT_OPTIONS } from "../../features/feed/postSort";
import { useFeedContext } from "../../features/feed/useFeedContext";
import { ListToolbar } from "../../features/lists/ListToolbar";
import { SortSheet } from "../../features/lists/SortSheet";
import { PeopleSheet } from "../../features/members/PeopleSheet";
import { formatDay, fromIsoDate, toIsoDate } from "../../lib/dates";
import { upcomingEvents } from "../../lib/events";
import {
  activeFilterCount,
  DEFAULT_SORT,
  EMPTY_FILTER,
  isGoing,
  isVisible,
  selectFeed,
  type PostFilter,
  type PostSort,
} from "../../lib/feed";
import { firstName } from "../../lib/names";
import { canEditCircle } from "../../lib/permissions";
import styles from "./CircleDetailPage.module.css";

type OpenSheet = "members" | "edit" | "sort" | "filter" | null;

const MEMBER_PREVIEW = 6;
const NO_TABS = new Set<never>();

export function CircleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me } = useMe();
  const { data: circles } = useCircles();
  const { data: members = [] } = useMembers();
  const { data: posts } = usePosts();
  const { ctx, authorName } = useFeedContext();
  const setMembership = useSetCircleMembership();
  const toast = useToast();
  const [filter, setFilter] = useState<PostFilter>(EMPTY_FILTER);
  const [sort, setSort] = useState<PostSort>(DEFAULT_SORT);
  const [sheet, setSheet] = useState<OpenSheet>(null);
  if (!me || !circles || !posts || !ctx) return null;

  const circle = circles.find((c) => c.id === id);
  if (!circle) return <EmptyState>Circle not found.</EmptyState>;

  const people = circle.memberIds.flatMap((mid) => members.find((m) => m.id === mid) ?? []);
  const creator = members.find((m) => m.id === circle.createdBy);
  const isMember = circle.memberIds.includes(me.id);
  const circlePosts = posts.filter((p) => p.publishedTo.includes(circle.id));
  const upcoming = upcomingEvents(
    circlePosts.filter((p) => isVisible(p, me.id, circles)),
    toIsoDate(new Date()),
  );
  const shown = selectFeed(circlePosts, ctx, { tabs: NO_TABS, filter, sort, query: "", authorName, now: new Date() });
  const close = () => setSheet(null);

  const setMember = (member: boolean) =>
    setMembership.mutate(
      { circleId: circle.id, memberId: me.id, member },
      { onSuccess: () => toast.success(member ? `Joined ${circle.name}` : `Left ${circle.name}`) },
    );

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <BackLink fallback="/circles" />
        <div className={styles.topActions}>
          {canEditCircle(circle, me) && (
            <IconButton
              label="Edit circle"
              size={36}
              icon={<MoreHorizontal size={18} strokeWidth={1.75} />}
              onClick={() => setSheet("edit")}
            />
          )}
        </div>
      </div>

      <section className={styles.hero} aria-labelledby="circle-name">
        <CircleTree imageUrl={circle.imageUrl} size={130} />
        <TypeTag>{circleTag(circle)}</TypeTag>
        <h1 id="circle-name" className={styles.name}>
          {circle.name}
        </h1>
        {circle.description && <p className={styles.description}>{circle.description}</p>}
        <p className={styles.meta}>
          {memberCount(people.length)}
          {creator && ` · started by ${firstName(creator.name)}`}
        </p>
        {circle.type !== "inner" && (
          <div className={styles.heroActions}>
            {isMember ? (
              <Button variant="tint" leftIcon={<Check size={18} />} aria-pressed onClick={() => setMember(false)}>
                Member
              </Button>
            ) : (
              <Button leftIcon={<Plus size={18} />} onClick={() => setMember(true)}>
                Join
              </Button>
            )}
          </div>
        )}
      </section>

      <section className={styles.section} aria-labelledby="circle-members">
        <div className={styles.sectionHeader}>
          <Eyebrow id="circle-members">Members</Eyebrow>
          <button type="button" className={styles.seeAll} onClick={() => setSheet("members")}>
            See all {people.length}
          </button>
        </div>
        <ul className={styles.members} aria-label="Members">
          {people.slice(0, MEMBER_PREVIEW).map((m) => (
            <li key={m.id}>
              <MemberChip member={m} />
            </li>
          ))}
        </ul>
      </section>

      {upcoming.length > 0 && (
        <section className={styles.section} aria-labelledby="circle-upcoming">
          <Eyebrow id="circle-upcoming">Upcoming</Eyebrow>
          <ul className={styles.events} aria-label="Upcoming">
            {upcoming.map((post) => (
              <li key={post.id}>
                <UpcomingRow
                  post={post}
                  host={members.find((m) => m.id === post.authorId)}
                  going={isGoing(post.id, me.id, ctx.rsvps)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.section} aria-labelledby="circle-posts">
        <div className={styles.sectionHeader}>
          <Eyebrow id="circle-posts">Posts</Eyebrow>
          <ListToolbar
            onSort={() => setSheet("sort")}
            onFilter={() => setSheet("filter")}
            filterCount={activeFilterCount(filter)}
          />
        </div>
        <PostList posts={shown} emptyText={isMember ? "No posts yet." : "Join to see this circle's posts."} />
      </section>

      {isMember ? (
        <Fab
          icon={<Plus size={24} strokeWidth={2} />}
          aria-label="New post"
          onClick={() => navigate(`/new?circle=${circle.id}`)}
        />
      ) : null}

      <PeopleSheet open={sheet === "members"} onClose={close} title="Members" people={people} />
      <CircleFormSheet open={sheet === "edit"} onClose={close} circle={circle} />
      <SortSheet open={sheet === "sort"} onClose={close} options={POST_SORT_OPTIONS} value={sort} onChange={setSort} />
      <PostFilterSheet
        open={sheet === "filter"}
        onClose={close}
        value={filter}
        onChange={setFilter}
        resultCount={shown.length}
        showPublishedIn={false}
      />
    </div>
  );
}

function MemberChip({ member }: { member: Member }) {
  return (
    <Link to={`/members/${member.id}`} className={styles.member}>
      <Avatar name={member.name} src={member.photoUrl} size={44} decorative />
      <span className={styles.memberName}>{firstName(member.name)}</span>
    </Link>
  );
}

function UpcomingRow({ post, host, going }: { post: Post; host: Member | undefined; going: boolean }) {
  const event = post.event!;
  const day = fromIsoDate(event.date!);
  const time = event.startTime ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ""}` : null;
  return (
    <div className={styles.event}>
      <div className={styles.dateBlock} aria-hidden="true">
        <span className={styles.weekday}>{day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
        <span className={styles.dayNumber}>{day.getDate()}</span>
      </div>
      <div className={styles.eventMain}>
        <Link to={`/events/${post.id}`} className={styles.eventTitle}>
          {post.title}
        </Link>
        <p className={styles.eventMeta}>
          <span className={styles.srOnly}>{formatDay(day)} · </span>
          {[time, host && `by ${firstName(host.name)}`].filter(Boolean).join(" · ")}
        </p>
      </div>
      {going ? (
        <span className={styles.going}>
          <Check size={14} aria-hidden="true" /> Going
        </span>
      ) : (
        <Link to={`/events/${post.id}`} className={styles.rsvp} aria-hidden="true" tabIndex={-1}>
          RSVP
        </Link>
      )}
    </div>
  );
}
