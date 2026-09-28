import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, Check, MapPin, Users } from "lucide-react";
import { Avatar, AvatarStack, Button, Eyebrow, ListGroup, ListRow } from "@analog/ui";
import { useCircles, useMe, useMembers, usePosts, useRsvps, useSetRsvp } from "../../data/hooks";
import type { RsvpStatus } from "../../data/types";
import { formatEventWhen } from "../../lib/dates";
import { mapUrl, rsvpStatus, spotsLine } from "../../lib/events";
import { isVisible } from "../../lib/feed";
import { firstName } from "../../lib/names";
import { postTag } from "../../lib/postLabel";
import { DetailTopBar } from "../../features/posts/DetailTopBar";
import { PostDiscussion } from "../../features/posts/PostDiscussion";
import { PeopleSheet } from "../../features/members/PeopleSheet";
import { RsvpConfirmSheet } from "../../features/posts/RsvpConfirmSheet";
import { EmptyState } from "../../components/EmptyState";
import styles from "./EventDetailPage.module.css";

export function EventDetailPage() {
  const { id } = useParams();
  const { me } = useMe();
  const { data: posts } = usePosts();
  const { data: members = [] } = useMembers();
  const { data: circles } = useCircles();
  const { data: rsvps = [] } = useRsvps();
  const setRsvp = useSetRsvp();
  const [showGoing, setShowGoing] = useState(false);
  const [pendingRsvp, setPendingRsvp] = useState<RsvpStatus | null>(null);
  if (!me || !posts || !circles) return null;

  const post = posts.find((p) => p.id === id);
  if (!post?.event || !isVisible(post, me.id, circles)) {
    return <EmptyState>Event not found.</EmptyState>;
  }

  const event = post.event;
  const host = members.find((m) => m.id === post.authorId);
  const goingPeople = rsvps
    .filter((r) => r.postId === post.id && r.status === "going")
    .flatMap((r) => members.find((m) => m.id === r.memberId) ?? []);
  const myStatus = rsvpStatus(post.id, me.id, rsvps);
  const spots = spotsLine(event, goingPeople.length);
  const answer = (status: RsvpStatus) => setRsvp.mutate({ postId: post.id, memberId: me.id, status });
  // Joining or leaving the going list is confirmed; declining while not going is not.
  const choose = (status: RsvpStatus) =>
    status === "going" || myStatus === "going" ? setPendingRsvp(status) : answer(status);

  return (
    <div className={styles.page}>
      <DetailTopBar post={post} me={me} />

      {post.imageUrl && <img src={post.imageUrl} alt="" className={styles.image} />}

      <header className={styles.header}>
        <Eyebrow as="p" tone="gold">
          {postTag(post, circles, me.id)}
        </Eyebrow>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.host}>
          <Avatar name={host?.name ?? "Former member"} src={host?.photoUrl} size={24} decorative />
          <span>
            Hosted by{" "}
            {host ? (
              <Link to={`/members/${host.id}`} className={styles.hostName}>
                {firstName(host.name)}
              </Link>
            ) : (
              "a former member"
            )}
          </span>
        </p>
      </header>

      <ListGroup aria-label="Event details">
        <ListRow icon={<CalendarDays size={18} />} iconStyle="plain" label={formatEventWhen(event)} />
        {event.address && event.addressVisible && (
          <ListRow
            icon={<MapPin size={18} />}
            iconStyle="plain"
            label={event.address}
            trailing={
              <a href={mapUrl(event.address)} target="_blank" rel="noreferrer" className={styles.mapLink}>
                Map
              </a>
            }
          />
        )}
        {spots && <ListRow icon={<Users size={18} />} iconStyle="plain" label={spots} />}
      </ListGroup>

      <div className={styles.rsvp}>
        <Button
          size="lg"
          variant={myStatus === "going" ? "primary" : "secondary"}
          leftIcon={myStatus === "going" ? <Check size={18} /> : undefined}
          aria-pressed={myStatus === "going"}
          onClick={() => myStatus !== "going" && choose("going")}
        >
          Going
        </Button>
        <Button
          size="lg"
          variant={myStatus === "declined" ? "primary" : "secondary"}
          aria-pressed={myStatus === "declined"}
          onClick={() => myStatus !== "declined" && choose("declined")}
        >
          Can't make it
        </Button>
      </div>

      {goingPeople.length > 0 && (
        <div className={styles.attendees}>
          <AvatarStack
            people={goingPeople.map((m) => ({ name: m.name, src: m.photoUrl }))}
            size={30}
            max={4}
          />
          <span className={styles.goingCount}>{goingPeople.length} going</span>
          <button type="button" className={styles.seeAll} onClick={() => setShowGoing(true)}>
            See all
          </button>
        </div>
      )}

      {post.body && (
        <section className={styles.about} aria-labelledby="event-about">
          <Eyebrow id="event-about">About</Eyebrow>
          <p className={styles.body}>{post.body}</p>
        </section>
      )}

      <PostDiscussion post={post} me={me} />

      <RsvpConfirmSheet post={post} pending={pendingRsvp} onClose={() => setPendingRsvp(null)} onConfirm={answer} />
      <PeopleSheet open={showGoing} onClose={() => setShowGoing(false)} title="Going" people={goingPeople} />
    </div>
  );
}
