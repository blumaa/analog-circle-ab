import { useState, type ReactNode } from "react";
import { Accordion, Badge, Button, Card, Label, Modal } from "@analog/ui";
import type { EventItem, Member, RsvpStatus } from "../data";
import { formatEventWhen } from "../lib/format";
import styles from "./EventCard.module.css";

export interface EventAttendee {
  member: Member;
  status: RsvpStatus;
  note?: string | null;
}

/** A meeting the current event's host can propose swapping with. */
export interface SwapTarget {
  id: string;
  /** e.g. "August 2026 · hosted by David" */
  label: string;
  hostName: string;
}

export interface EventCardProps {
  event: EventItem;
  host: Member | null;
  currentMemberId: string | null;
  going: number;
  total: number;
  /** Full attendee list used to render the non-going breakdown. */
  attendees?: EventAttendee[];
  /** Other meetings (with host names) shown in the "SWAP WITH" dropdown. */
  swapTargets?: SwapTarget[];
  /** Human label for this event's month, e.g. "July 2026". */
  monthLabel?: string;
  /** Persist a proposed swap. The modal closes regardless. */
  onProposeSwap?: (input: { targetEventId: string; message: string }) => void;
  /** Persist an RSVP change for the current member. */
  onRsvp?: (status: RsvpStatus, note?: string | null) => void;
  /**
   * When true, renders the full collapsible card (dashboard "Coming Up" style).
   * When false (default), renders the flat calendar list-item style.
   */
  defaultOpen?: boolean;
}

/** Generate and trigger .ics download for a single event. */
function downloadIcs(event: EventItem): void {
  const datePart = event.date.replace(/-/g, "");
  const startDt = `${datePart}T${event.startTime.replace(":", "")}00`;
  const endDt = `${datePart}T${event.endTime.replace(":", "")}00`;
  const uid = `${event.id}@theanalogcircle.com`;
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Analog Circle//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${startDt}`,
    `DTEND:${endDt}`,
    `SUMMARY:${event.title}`,
    event.address ? `LOCATION:${event.address}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const blob = new Blob([lines], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function statusLabel(status: RsvpStatus): string {
  if (status === "declined") return "can't make it";
  return "maybe";
}

function AttendeeList({ attendees }: { attendees: EventAttendee[] }) {
  const nonGoing = attendees.filter((a) => a.status !== "going");
  if (nonGoing.length === 0) return null;
  return (
    <ul className={styles.attendeeList} aria-label="Members not going">
      {nonGoing.map((a) => (
        <li key={a.member.id} className={styles.attendeeRow}>
          <p className={styles.attendeeHead}>
            <span className={styles.attendeeName}>{a.member.name}</span>
            <span className={styles.attendeeStatus}>{statusLabel(a.status)}</span>
          </p>
          {a.note && <p className={styles.attendeeNote}>&ldquo;{a.note}&rdquo;</p>}
        </li>
      ))}
    </ul>
  );
}

/** Compact hairline pill that opens the hosting-swap modal. */
function ProposeSwapButton({
  swapTargets,
  monthLabel,
  onProposeSwap,
}: {
  swapTargets: SwapTarget[];
  monthLabel?: string;
  onProposeSwap?: (input: { targetEventId: string; message: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [targetEventId, setTargetEventId] = useState("");
  const [message, setMessage] = useState("");

  const close = () => {
    setOpen(false);
    setTargetEventId("");
    setMessage("");
  };

  const handleSend = () => {
    onProposeSwap?.({ targetEventId, message });
    close();
  };

  return (
    <>
      <div className={styles.swapBox}>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Propose hosting swap
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        title="Propose hosting swap"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSend} disabled={!targetEventId}>
              Send
            </Button>
          </>
        }
      >
        <div className={styles.swapForm}>
          {monthLabel && (
            <p className={styles.swapMeeting}>
              Your meeting: <strong>{monthLabel}</strong>
            </p>
          )}

          <label className={styles.swapField}>
            <Label as="span">Swap with</Label>
            <select
              className={styles.swapSelect}
              value={targetEventId}
              onChange={(e) => setTargetEventId(e.target.value)}
            >
              <option value="" disabled>
                Choose a meeting…
              </option>
              {swapTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.swapField}>
            <Label as="span">Message (optional)</Label>
            <textarea
              className={styles.swapTextarea}
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note for the other host…"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}

/** RSVP toggle for the calendar variant (non-hosting members). */
function RsvpControl({
  status,
  onRsvp,
}: {
  status: RsvpStatus;
  onRsvp?: (status: RsvpStatus, note?: string | null) => void;
}) {
  const going = status === "going";
  const [note, setNote] = useState("");

  return (
    <Accordion
      summary={<Label>RSVP</Label>}
      trailing={
        <span className={going ? styles.rsvpGoing : styles.rsvpNotGoing}>
          {going ? "You're going" : "You're not going"}
        </span>
      }
    >
      <div className={styles.rsvpBody}>
        {going ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => onRsvp?.("declined", note || null)}>
              Can&apos;t make it
            </Button>
            <label className={styles.swapField}>
              <Label as="span">Reason (optional)</Label>
              <textarea
                className={styles.swapTextarea}
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Let everyone know why…"
              />
            </label>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => onRsvp?.("going", null)}>
            I can make it after all
          </Button>
        )}
      </div>
    </Accordion>
  );
}

export function EventCard({
  event,
  host,
  currentMemberId,
  going,
  total,
  attendees,
  swapTargets = [],
  monthLabel,
  onProposeSwap,
  onRsvp,
  defaultOpen = false,
}: EventCardProps) {
  const isHosting = !!host && host.id === currentMemberId;
  const when = formatEventWhen(event.date, event.startTime, event.endTime);
  const hostName = host?.name ?? null;
  const myStatus: RsvpStatus =
    attendees?.find((a) => a.member.id === currentMemberId)?.status ?? "going";

  if (defaultOpen) {
    // Dashboard "Coming Up" style — collapsible Card with full detail
    return (
      <Card variant={isHosting ? "active" : "default"} className={styles.card}>
        <Accordion
          defaultOpen
          summary={<span className={styles.title}>{event.title}</span>}
          trailing={
            <span className={styles.meta}>
              {[isHosting ? "You're hosting" : null, when].filter(Boolean).join(" · ")}
            </span>
          }
        >
          <div className={styles.body}>
            <Field label="WHEN">{when}</Field>
            {event.address && (
              <Field label="ADDRESS">
                <a
                  className={styles.link}
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {event.address}
                </a>
              </Field>
            )}
            {event.guideUrl && (
              <Field label="GUIDE">
                <a className={styles.link} href={event.guideUrl} target="_blank" rel="noreferrer">
                  Hosting guide
                </a>
              </Field>
            )}
            <Field label="HOST">
              {isHosting ? "You're the host" : (host?.name ?? "TBD")}
            </Field>

            {isHosting && (
              <ProposeSwapButton
                swapTargets={swapTargets}
                monthLabel={monthLabel}
                onProposeSwap={onProposeSwap}
              />
            )}

            <hr className={styles.divider} />

            <Accordion
              summary={<Label>ATTENDANCE</Label>}
              trailing={
                <span className={styles.attendanceBadge}>
                  {going} of {total} going
                </span>
              }
            >
              {attendees && <AttendeeList attendees={attendees} />}
              {(!attendees || attendees.filter((a) => a.status !== "going").length === 0) && (
                <p className={styles.attendanceNote}>
                  {going} of {total} members are going to this meeting.
                </p>
              )}
            </Accordion>
          </div>
        </Accordion>
      </Card>
    );
  }

  // Calendar list-item style — flat, no Card wrapper
  return (
    <div className={styles.calItem}>
      {/* Badges row */}
      <div className={styles.badges}>
        <Badge variant="meeting">MEETING</Badge>
        {isHosting && <Badge variant="accent">YOU&apos;RE HOSTING</Badge>}
      </div>

      {/* Date + host line */}
      <p className={styles.when}>
        {when}
        {hostName && (
          <>
            <span className={styles.dot}> · Host: </span>
            <span>{hostName}</span>
          </>
        )}
      </p>

      {/* ADD TO CALENDAR collapsible */}
      <Accordion summary={<span className={styles.addCalLabel}>ADD TO CALENDAR</span>}>
        <div className={styles.calOptions}>
          <button
            type="button"
            className={styles.calOptionBtn}
            onClick={() => downloadIcs(event)}
          >
            Download .ics
          </button>
          <a
            className={styles.calOptionBtn}
            href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replace(/-/g, "")}T${event.startTime.replace(":", "")}00/${event.date.replace(/-/g, "")}T${event.endTime.replace(":", "")}00`}
            target="_blank"
            rel="noreferrer"
          >
            Google Calendar
          </a>
        </div>
      </Accordion>

      {/* PROPOSE HOSTING SWAP (hosting member only) */}
      {isHosting && (
        <ProposeSwapButton
          swapTargets={swapTargets}
          monthLabel={monthLabel}
          onProposeSwap={onProposeSwap}
        />
      )}

      {/* RSVP (non-hosting members) */}
      {!isHosting && <RsvpControl status={myStatus} onRsvp={onRsvp} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <Label>{label}</Label>
      <div className={styles.value}>{children}</div>
    </div>
  );
}
