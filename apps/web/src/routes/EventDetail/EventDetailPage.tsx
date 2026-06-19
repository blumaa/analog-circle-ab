import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Spinner, useToast } from "@analog/ui";
import {
  useCurrentMemberId,
  useEvents,
  useMember,
  useMembers,
  useRsvps,
  useSetRsvp,
} from "../../data/hooks";
import { EventCard, type SwapTarget } from "../../components/EventCard";
import { ShareButton } from "../../components/ShareButton";
import { formatMonthYear } from "../../lib/format";
import styles from "./EventDetailPage.module.css";

export function EventDetailPage() {
  const { id = "" } = useParams();
  const { data: memberId = null } = useCurrentMemberId();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const event = events.find((e) => e.id === id) ?? null;

  // Resolve attendees from the full member roster so every host/rsvp resolves.
  const { data: members = [] } = useMembers("analog");
  const { data: host = null } = useMember(event?.hostId ?? "");
  const { data: rsvps = [] } = useRsvps(event?.id ?? "");
  const setRsvp = useSetRsvp();
  const toast = useToast();

  if (!event) {
    if (eventsLoading) return <Spinner label="Loading event" />;
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>Event not found.</p>
      </div>
    );
  }

  const going = rsvps.filter((r) => r.status === "going").length;
  const attendees = rsvps
    .map((r) => {
      const member = members.find((m) => m.id === r.memberId);
      if (!member) return null;
      return { member, status: r.status, note: r.note };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  const swapTargets: SwapTarget[] = events
    .filter((e) => e.id !== event.id)
    .map((e) => {
      const hostName = members.find((m) => m.id === e.hostId)?.name ?? "TBD";
      return {
        id: e.id,
        label: `${formatMonthYear(e.date)} · hosted by ${hostName}`,
        hostName,
      };
    });

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link className={styles.back} to="/innercircle/calendar">
          <ArrowLeft aria-hidden size={16} />
          Back to The Square
        </Link>
        <ShareButton title={event.title} />
      </div>

      <EventCard
        event={event}
        host={host}
        currentMemberId={memberId}
        going={going}
        total={members.length}
        attendees={attendees}
        swapTargets={swapTargets}
        monthLabel={formatMonthYear(event.date)}
        onRsvp={(status, note) => {
          if (!memberId) return;
          setRsvp.mutate(
            { eventId: event.id, memberId, status, note },
            {
              onSuccess: () => toast.success("RSVP updated."),
              onError: () => toast.error("Couldn't update your RSVP."),
            },
          );
        }}
        onProposeSwap={() => toast.success("Hosting-swap proposed.")}
        defaultOpen
      />
    </div>
  );
}
