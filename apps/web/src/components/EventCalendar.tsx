import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Calendar,
  Card,
  Spinner,
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
import { EventForm, type EventFormValues } from "./EventForm";
import { canCreateEvent, canManageEvent } from "../lib/permissions";
import { formatMonthYear } from "../lib/format";
import styles from "./EventCalendar.module.css";

export type EventCalendarView = "month" | "week" | "list";

export interface EventCalendarProps {
  /** analog = all events; inner = only this member's inner-group meetings. */
  scope: Scope;
  view: EventCalendarView;
  /** When provided, a "New meeting" affordance and the create form are shown (list view). */
  onCreate?: (values: EventFormValues) => void;
  /** When provided, list-view events become editable. */
  onEdit?: (id: string, values: EventFormValues) => void;
  /** When provided, list-view events become deletable. */
  onDelete?: (id: string) => void;
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
          setRsvp.mutate({ eventId: event.id, memberId: currentMemberId, status, note });
        }}
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
  onCreate,
  onEdit,
  onDelete,
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
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    }));

    if (loading) return <Spinner label="Loading calendar" />;

    return (
      <Calendar
        events={calendarEvents}
        view={view as CalendarView}
        date={calendarDate}
        onNavigate={setCalendarDate}
        onSelectEvent={() => {
          if (innerGroupId) navigate(`/innercircle/group/${innerGroupId}`);
        }}
      />
    );
  }

  // ---- List view ----
  const showManagement = !!(onCreate || onEdit || onDelete);

  return (
    <div className={styles.list}>
      {onCreate && canCreateEvent(memberId) && !creating && (
        <Button variant="outline" onClick={() => setCreating(true)}>
          New meeting
        </Button>
      )}

      {onCreate && creating && (
        <Card>
          <EventForm
            groupId={innerGroupId}
            onSubmit={(v) => {
              onCreate(v);
              setCreating(false);
            }}
            onCancel={() => setCreating(false)}
            submitLabel="Create meeting"
          />
        </Card>
      )}

      {loading ? (
        <Spinner label="Loading meetings" />
      ) : (
        <ul className={styles.eventList}>
          {sortedEvents.map((ev) =>
            editingId === ev.id && onEdit ? (
              <li key={ev.id} className={styles.editRow}>
                <Card>
                  <EventForm
                    groupId={innerGroupId}
                    initial={ev}
                    onSubmit={(v) => {
                      onEdit(ev.id, v);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save changes"
                  />
                </Card>
              </li>
            ) : (
              <EventCardWithRsvps
                key={ev.id}
                event={ev}
                host={memberById(ev.hostId)}
                currentMemberId={memberId}
                members={members}
                swapTargets={swapTargetsFor(ev.id)}
                canManage={showManagement && canManageEvent(ev, memberId)}
                onEdit={onEdit ? () => setEditingId(ev.id) : undefined}
                onDelete={onDelete ? () => onDelete(ev.id) : undefined}
              />
            ),
          )}
        </ul>
      )}
    </div>
  );
}
