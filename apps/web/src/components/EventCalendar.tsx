import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Calendar,
  Spinner,
  useToast,
  type CalendarEvent,
  type CalendarView,
} from "@analog/ui";
import {
  useCurrentMemberId,
  useEvents,
  useInnerGroup,
  useMembers,
  useRsvps,
  useSetRsvp,
} from "../data/hooks";
import type { EventItem, Member, Scope } from "../data";
import { EventCard, type SwapTarget } from "./EventCard";
import type { EventFormValues } from "./EventForm";
import { canManageEvent } from "../lib/permissions";
import { formatMonthYear } from "../lib/format";
import styles from "./EventCalendar.module.css";

export type EventCalendarView = "month" | "week" | "list";

export interface EventCalendarProps {
  /** analog = all events; inner = only this member's inner-group meetings. */
  scope: Scope;
  view: EventCalendarView;
  /** When provided, the page can wire up a create handler (called from a modal). */
  onCreate?: (values: EventFormValues) => void;
  /** When provided, the page can wire up an update handler (called from a modal). */
  onEdit?: (id: string, values: EventFormValues) => void;
  /** When provided, list-view events become deletable. */
  onDelete?: (id: string) => void;
  /** Called when the user clicks the Edit button on an event; the page opens a modal. */
  onRequestEdit?: (event: EventItem) => void;
  /** Used to build the create/edit form's groupId field. */
  groupId?: string;
}

/** Combine an ISO date + HH:MM into a Date. */
function toDate(dateIso: string, time: string): Date {
  return new Date(`${dateIso}T${time}:00`);
}

/** Fetches rsvps for one event and renders the EventCard with attendance. */
function EventCardWithRsvps({
  event,
  host,
  currentMemberId,
  members,
  swapTargets,
  canManage,
  onEdit,
  onDelete,
}: {
  event: EventItem;
  host: Member | null;
  currentMemberId: string | null;
  members: Member[];
  swapTargets: SwapTarget[];
  canManage: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { data: rsvps = [] } = useRsvps(event.id);
  const setRsvp = useSetRsvp();
  const toast = useToast();
  const going = rsvps.filter((r) => r.status === "going").length;
  const attendees = rsvps
    .map((r) => {
      const member = members.find((m) => m.id === r.memberId);
      if (!member) return null;
      return { member, status: r.status, note: r.note };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return (
    <li className={styles.eventRow}>
      <div className={styles.monthRow}>
        <span className={styles.month}>{formatMonthYear(event.date)}</span>
      </div>
      <EventCard
        event={event}
        host={host}
        currentMemberId={currentMemberId}
        going={going}
        total={members.length}
        attendees={attendees}
        swapTargets={swapTargets}
        monthLabel={formatMonthYear(event.date)}
        onRsvp={(status, note) => {
          if (!currentMemberId) return;
          setRsvp.mutate(
            { eventId: event.id, memberId: currentMemberId, status, note },
            {
              onSuccess: () => toast.success("RSVP updated."),
              onError: () => toast.error("Couldn't update your RSVP."),
            },
          );
        }}
        onProposeSwap={() => toast.success("Hosting-swap proposed.")}
      />
      {canManage && (onEdit || onDelete) && (
        <div className={styles.manage}>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button size="sm" variant="ghost" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * Domain calendar: filters events by scope, resolves hosts/members, and renders
 * either the generic grid Calendar (month/week) or the EventCard list.
 */
export function EventCalendar({
  scope,
  view,
  onCreate: _onCreate,
  onEdit,
  onDelete,
  onRequestEdit,
  groupId,
}: EventCalendarProps) {
  const navigate = useNavigate();
  const { data: memberId = null } = useCurrentMemberId();
  const { data: innerGroup } = useInnerGroup(memberId);
  const innerGroupId = innerGroup?.id ?? groupId ?? "";

  // analog scope needs every member to resolve hosts/attendees; inner scope uses inner members.
  const { data: members = [], isLoading: membersLoading } = useMembers(
    scope === "inner" ? "inner" : "analog",
    scope === "inner" ? innerGroupId : undefined,
  );
  const { data: allEvents = [], isLoading: eventsLoading } = useEvents();

  const events = useMemo(
    () =>
      scope === "inner"
        ? allEvents.filter((e) => e.groupId === innerGroupId)
        : allEvents,
    [allEvents, scope, innerGroupId],
  );

  const sortedEvents = useMemo(
    () =>
      [...events].sort((a, b) =>
        `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
      ),
    [events],
  );

  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const memberById = (mid: string | null) => members.find((m) => m.id === mid) ?? null;

  const swapTargetsFor = (currentId: string): SwapTarget[] =>
    events
      .filter((e) => e.id !== currentId)
      .map((e) => {
        const hostName = memberById(e.hostId)?.name ?? "TBD";
        return {
          id: e.id,
          label: `${formatMonthYear(e.date)} · hosted by ${hostName}`,
          hostName,
        };
      });

  const loading = eventsLoading || membersLoading;

  // ---- Grid views (month / week) ----
  if (view === "month" || view === "week") {
    const calendarEvents: CalendarEvent[] = sortedEvents.map((e) => ({
      id: e.id,
      title: e.title,
      start: toDate(e.date, e.startTime),
      end: toDate(e.date, e.endTime),
      // Inner-circle events = gold (accent); Analog-circle events = blue (info).
      tone: e.scope === "inner" ? "accent" : "info",
    }));

    if (loading) return <Spinner label="Loading calendar" />;

    return (
      <Calendar
        events={calendarEvents}
        view={view as CalendarView}
        date={calendarDate}
        onNavigate={setCalendarDate}
        onSelectEvent={(id) => {
          if (id) navigate(`/innercircle/event/${id}`);
        }}
      />
    );
  }

  // ---- List view ----
  const showManagement = !!(onEdit || onDelete || onRequestEdit);

  return (
    <div className={styles.list}>
      {loading ? (
        <Spinner label="Loading meetings" />
      ) : (
        <ul className={styles.eventList}>
          {sortedEvents.map((ev) => (
            <EventCardWithRsvps
              key={ev.id}
              event={ev}
              host={memberById(ev.hostId)}
              currentMemberId={memberId}
              members={members}
              swapTargets={swapTargetsFor(ev.id)}
              canManage={showManagement && canManageEvent(ev, memberId)}
              onEdit={onRequestEdit ? () => onRequestEdit(ev) : undefined}
              onDelete={onDelete ? () => onDelete(ev.id) : undefined}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
