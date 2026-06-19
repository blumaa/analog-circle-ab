import type { ReactNode } from "react";
import { CalendarDays, Compass, HeartHandshake, User, Users } from "lucide-react";
import { Label, NavCard, useToast, type NavCardTone } from "@analog/ui";
import {
  useCurrentMemberId,
  useEvents,
  useInnerGroup,
  useMember,
  useMembers,
  useRsvps,
} from "../../data/hooks";
import { EventCard, type SwapTarget } from "../../components/EventCard";
import { WhatsAppCard } from "../../components/WhatsAppCard";
import { formatMonthYear } from "../../lib/format";
import styles from "./DashboardPage.module.css";

const todayIso = () => new Date().toISOString().slice(0, 10);

const COMMUNITY_LINKS: ReadonlyArray<{
  label: string;
  description: string;
  icon: ReactNode;
  href: (groupId: string) => string;
  tone: NavCardTone;
}> = [
  {
    label: "Your Circle",
    description: "Meetings, 1-1s, members, map, and food preferences",
    icon: <Users />,
    href: (groupId) => `/innercircle/group/${groupId}`,
    tone: "accent",
  },
  {
    label: "The Square",
    description: "Browse and RSVP to upcoming events",
    icon: <CalendarDays />,
    href: () => "/innercircle/calendar",
    tone: "sky",
  },
  {
    label: "The Loop",
    description: "Ask for help and offer what you can",
    icon: <HeartHandshake />,
    href: () => "/innercircle/the-loop",
    tone: "rose",
  },
  {
    label: "Directory",
    description: "Browse everyone in the community",
    icon: <Compass />,
    href: () => "/innercircle/members",
    tone: "indigo",
  },
  {
    label: "Your profile",
    description: "Bio, contact details, and group info",
    icon: <User />,
    href: () => "/innercircle/profile",
    tone: "green",
  },
];

export function DashboardPage() {
  const { data: memberId = null } = useCurrentMemberId();
  const { data: me } = useMember(memberId ?? "");
  const { data: innerGroup } = useInnerGroup(memberId);
  const { data: events = [] } = useEvents(innerGroup?.id);
  const { data: innerMembers = [] } = useMembers("inner", innerGroup?.id);

  const today = todayIso();
  const nextEvent = events.find((e) => e.date >= today) ?? events[0];

  const { data: host = null } = useMember(nextEvent?.hostId ?? "");
  const { data: rsvps = [] } = useRsvps(nextEvent?.id ?? "");
  const going = rsvps.filter((r) => r.status === "going").length;

  const attendees = rsvps
    .map((r) => {
      const member = innerMembers.find((m) => m.id === r.memberId);
      if (!member) return null;
      return { member, status: r.status, note: r.note };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  const swapTargets: SwapTarget[] = nextEvent
    ? events
        .filter((e) => e.id !== nextEvent.id)
        .map((e) => {
          const eventHost = innerMembers.find((m) => m.id === e.hostId);
          const hostName = eventHost?.name ?? "TBD";
          return {
            id: e.id,
            label: `${formatMonthYear(e.date)} · hosted by ${hostName}`,
            hostName,
          };
        })
    : [];

  const firstName = me?.name.split(" ")[0] ?? "";
  const toast = useToast();

  return (
    <div className={styles.page}>
      <section className={styles.welcomeSection} aria-label="Welcome">
        <h2 className={styles.welcome}>
          Welcome back, <span className={styles.name}>{firstName}</span>
        </h2>
      </section>

      {nextEvent && (
        <section className={styles.section}>
          <Label as="div">Coming up</Label>
          <EventCard
            event={nextEvent}
            host={host}
            currentMemberId={memberId}
            going={going}
            total={innerMembers.length}
            attendees={attendees}
            swapTargets={swapTargets}
            monthLabel={formatMonthYear(nextEvent.date)}
            onProposeSwap={() => toast.success("Hosting-swap proposed.")}
            defaultOpen
          />
        </section>
      )}

      {me?.whatsappUrl && (
        <div className={styles.whatsappWrapper}>
          <WhatsAppCard href={me.whatsappUrl} />
        </div>
      )}

      <section className={styles.section} aria-label="Community">
        <Label as="div">Community</Label>
        <div className={styles.communityList}>
          {COMMUNITY_LINKS.map(({ label, description, icon, href, tone }) => (
            <NavCard
              key={label}
              icon={icon}
              title={label}
              description={description}
              href={href(innerGroup?.id ?? "")}
              tone={tone}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
