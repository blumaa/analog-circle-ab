import { lazy, Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { Fab, Header, Modal, SegmentedControl, useToast } from "@analog/ui";
import type { EventCalendarView } from "../../components/EventCalendar";
import { EventForm, type EventFormValues } from "../../components/EventForm";
import { PageLoader } from "../../components/PageLoader";
import {
  useCreateEvent,
  useCurrentMemberId,
  useInnerGroup,
  useUpdateEvent,
} from "../../data/hooks";
import type { EventItem, Scope } from "../../data";
import { canCreateEvent } from "../../lib/permissions";
import styles from "./CalendarPage.module.css";

// react-big-calendar is heavy — load it only with this route.
const EventCalendar = lazy(() =>
  import("../../components/EventCalendar").then((m) => ({ default: m.EventCalendar })),
);

const SCOPE_OPTIONS = [
  { value: "analog", label: "Analog Circle" },
  { value: "inner", label: "Inner Circle" },
];

const VIEW_OPTIONS = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "list", label: "List" },
];

export function CalendarPage() {
  const [scope, setScope] = useState<Scope>("analog");
  const [view, setView] = useState<EventCalendarView>("month");
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);

  const { data: memberId = null } = useCurrentMemberId();
  const { data: innerGroup } = useInnerGroup(memberId);
  const innerGroupId = innerGroup?.id ?? "";

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(innerGroupId);
  const toast = useToast();

  const handleCreate = (v: EventFormValues) => {
    createEvent.mutate(
      {
        scope: v.scope,
        groupId: innerGroupId,
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
          toast.success("Meeting created.");
          setCreateOpen(false);
        },
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
        onSuccess: () => {
          toast.success("Meeting updated.");
          setEditEvent(null);
        },
        onError: () => toast.error("Couldn't update the meeting."),
      },
    );
  };

  return (
    <div className={styles.page}>
      <Header title="The Square" eyebrow="Community" />

      <div className={styles.controls}>
        <SegmentedControl
          ariaLabel="Calendar scope"
          options={SCOPE_OPTIONS}
          value={scope}
          onChange={(v) => setScope(v as Scope)}
        />
        <SegmentedControl
          ariaLabel="Calendar view"
          options={VIEW_OPTIONS}
          value={view}
          onChange={(v) => setView(v as EventCalendarView)}
        />
      </div>

      <Suspense fallback={<PageLoader />}>
        <EventCalendar
          scope={scope}
          view={view}
          groupId={innerGroupId}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onRequestEdit={(ev) => setEditEvent(ev)}
        />
      </Suspense>

      {canCreateEvent(memberId) && (
        <Fab
          icon={<Plus size={24} />}
          aria-label="New meeting"
          onClick={() => setCreateOpen(true)}
        />
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New meeting"
      >
        <EventForm
          groupId={innerGroupId}
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitLabel="Create meeting"
        />
      </Modal>

      <Modal
        open={!!editEvent}
        onClose={() => setEditEvent(null)}
        title="Edit meeting"
      >
        {editEvent && (
          <EventForm
            groupId={innerGroupId}
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
