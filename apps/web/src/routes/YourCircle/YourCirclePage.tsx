import { lazy, Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { Accordion, Button, Fab, Modal, Spinner, Tabs, useToast } from "@analog/ui";
import {
  useCreateEvent,
  useCurrentMemberId,
  useDeleteEvent,
  useEvents,
  useMembers,
  useUpdateEvent,
} from "../../data/hooks";
import type { EventItem } from "../../data";
import { EventForm, type EventFormValues } from "../../components/EventForm";
import { FoodList } from "../../components/FoodList";
import { MemberCard } from "../../components/MemberCard";
import { canCreateEvent } from "../../lib/permissions";
import { PageLoader } from "../../components/PageLoader";
import styles from "./YourCirclePage.module.css";

// Heavy deps (react-big-calendar, Leaflet) loaded only when their tab is opened.
const EventCalendar = lazy(() =>
  import("../../components/EventCalendar").then((m) => ({ default: m.EventCalendar })),
);
const MapView = lazy(() =>
  import("../../components/MapView").then((m) => ({ default: m.MapView })),
);

const TABS = [
  { value: "calendar", label: "Calendar" },
  { value: "members", label: "Members" },
  { value: "map", label: "Map" },
  { value: "food", label: "Food" },
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
  a.download = "analog-circle-events.ics";
  a.click();
  URL.revokeObjectURL(url);
}

export function YourCirclePage() {
  const { id: groupId = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const view = params.get("view") ?? "calendar";

  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);

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
        onSuccess: () => {
          toast.success("Event created.");
          setCreateOpen(false);
        },
        onError: () => toast.error("Couldn't create the event."),
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
        onSuccess: () => {
          toast.success("Event updated.");
          setEditEvent(null);
        },
        onError: () => toast.error("Couldn't update the event."),
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
            All Inner Circle events and your 1-1s for the year. Use &ldquo;Propose hosting
            swap&rdquo; to trade dates with another host if needed.
          </p>

          {/* ADD ALL EVENTS TO CALENDAR */}
          {events.length > 0 && (
            <div className={styles.addAllWrap}>
              <Accordion
                summary={
                  <span className={styles.addAllLabel}>ADD ALL EVENTS TO CALENDAR</span>
                }
              >
                <div className={styles.addAllOptions}>
                  <Button
                    variant="soft"
                    size="sm"
                    className={styles.calBtn}
                    onClick={() => downloadAllIcs(events)}
                  >
                    Download .ics file
                  </Button>
                </div>
              </Accordion>
            </div>
          )}

          <Suspense fallback={<PageLoader />}>
            <EventCalendar
              scope="inner"
              view="list"
              groupId={groupId}
              onCreate={handleCreate}
              onEdit={handleEdit}
              onRequestEdit={(ev) => setEditEvent(ev)}
              onDelete={(id) =>
                deleteEvent.mutate(id, {
                  onSuccess: () => toast.success("Event deleted."),
                  onError: () => toast.error("Couldn't delete the event."),
                })
              }
            />
          </Suspense>
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

      {view === "map" &&
        (membersLoading ? (
          <Spinner />
        ) : (
          <Suspense fallback={<PageLoader />}>
            <MapView members={members} />
          </Suspense>
        ))}

      {view === "food" && <FoodList members={members} />}

      {canCreateEvent(memberId) && view === "calendar" && (
        <Fab
          icon={<Plus size={24} />}
          aria-label="New event"
          onClick={() => setCreateOpen(true)}
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New event"
      >
        <EventForm
          groupId={groupId}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create event"
        />
      </Modal>

      <Modal
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        title="Edit event"
      >
        {editEvent && (
          <EventForm
            groupId={groupId}
            initial={editEvent}
            onSubmit={(v) => handleEdit(editEvent.id, v)}
            onCancel={() => setEditEvent(null)}
            submitLabel="Save changes"
          />
        )}
      </Modal>
    </div>
  );
}
