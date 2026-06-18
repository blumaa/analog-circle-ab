import { useParams, useSearchParams } from "react-router-dom";
import { Accordion, Button, Spinner, Tabs, useToast } from "@analog/ui";
import {
  useCreateEvent,
  useCurrentMemberId,
  useDeleteEvent,
  useEvents,
  useMembers,
  useUpdateEvent,
} from "../../data/hooks";
import type { EventItem } from "../../data";
import { EventCalendar } from "../../components/EventCalendar";
import { type EventFormValues } from "../../components/EventForm";
import { MapView } from "../../components/MapView";
import { FoodList } from "../../components/FoodList";
import { MemberCard } from "../../components/MemberCard";
import styles from "./YourCirclePage.module.css";

const TABS = [
  { value: "calendar", label: "CALENDAR" },
  { value: "members", label: "MEMBERS" },
  { value: "map", label: "MAP" },
  { value: "food", label: "FOOD" },
];

/** Generate .ics content for all events and trigger bulk download. */
function downloadAllIcs(events: EventItem[]): void {
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const vevents = events
    .map((ev) => {
      const datePart = ev.date.replace(/-/g, "");
      const startDt = `${datePart}T${ev.startTime.replace(":", "")}00`;
      const endDt = `${datePart}T${ev.endTime.replace(":", "")}00`;
      return [
        "BEGIN:VEVENT",
        `UID:${ev.id}@theanalogcircle.com`,
        `DTSTAMP:${now}`,
        `DTSTART:${startDt}`,
        `DTEND:${endDt}`,
        `SUMMARY:${ev.title}`,
        ev.address ? `LOCATION:${ev.address}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\r\n");
    })
    .join("\r\n");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Analog Circle//EN",
    vevents,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analog-circle-meetings.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function YourCirclePage() {
  const { id: groupId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") ?? "calendar";

  const { data: memberId = null } = useCurrentMemberId();
  const { data: members = [], isLoading: membersLoading } = useMembers("inner", groupId);
  const { data: events = [] } = useEvents(groupId);

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(groupId);
  const deleteEvent = useDeleteEvent(groupId);
  const toast = useToast();

  const handleCreate = (v: EventFormValues) => {
    createEvent.mutate(
      {
        scope: v.scope,
        groupId,
        title: v.title,
        date: v.date,
        startTime: v.startTime,
        endTime: v.endTime,
        hostId: memberId,
        creatorId: memberId ?? "",
        address: v.address || null,
        guideUrl: null,
        type: "event",
      },
      {
        onSuccess: () => toast.success("Meeting created."),
        onError: () => toast.error("Couldn't create the meeting."),
      },
    );
  };

  const handleEdit = (id: string, v: EventFormValues) => {
    updateEvent.mutate(
      {
        id,
        patch: {
          title: v.title,
          date: v.date,
          startTime: v.startTime,
          endTime: v.endTime,
          address: v.address || null,
          scope: v.scope,
        },
      },
      {
        onSuccess: () => toast.success("Meeting updated."),
        onError: () => toast.error("Couldn't update the meeting."),
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <Tabs
          ariaLabel="Inner Circle sections"
          tabs={TABS}
          value={view}
          onChange={(v) => setParams({ view: v }, { replace: true })}
        />
        <div className={styles.subbar}>
          <a
            href="https://chat.whatsapp.com/Dr8h3LzLTnQCN5UIsvlJqt?mode=gi_t"
            className={styles.whatsappLink}
            target="_blank"
            rel="noreferrer"
          >
            ACCESS YOUR PRIVATE WHATSAPP GROUP
          </a>
          <span className={styles.memberCount}>{members.length} members</span>
        </div>
      </div>

      {view === "calendar" && (
        <section className={styles.section}>
          <p className={styles.intro}>
            All Inner Circle meetings and your 1-1s for the year. Use &ldquo;Propose hosting
            swap&rdquo; to trade dates with another host if needed.
          </p>

          {/* ADD ALL MEETINGS TO CALENDAR */}
          {events.length > 0 && (
            <div className={styles.addAllWrap}>
              <Accordion
                summary={
                  <span className={styles.addAllLabel}>ADD ALL MEETINGS TO CALENDAR</span>
                }
              >
                <div className={styles.addAllOptions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.calBtn}
                    onClick={() => downloadAllIcs(events)}
                  >
                    Download all as .ics
                  </Button>
                </div>
              </Accordion>
            </div>
          )}

          <EventCalendar
            scope="inner"
            view="list"
            groupId={groupId}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={(id) =>
              deleteEvent.mutate(id, {
                onSuccess: () => toast.success("Meeting deleted."),
                onError: () => toast.error("Couldn't delete the meeting."),
              })
            }
          />
        </section>
      )}

      {view === "members" && (
        <section className={styles.grid}>
          {membersLoading ? (
            <Spinner />
          ) : (
            members.map((m) => <MemberCard key={m.id} member={m} />)
          )}
        </section>
      )}

      {view === "map" && (membersLoading ? <Spinner /> : <MapView members={members} />)}

      {view === "food" && <FoodList members={members} />}
    </div>
  );
}
