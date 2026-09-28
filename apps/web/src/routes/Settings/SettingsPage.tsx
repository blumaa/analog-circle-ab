import { Cake, ShieldCheck } from "lucide-react";
import { Eyebrow, SegmentedControl, Toggle } from "@analog/ui";
import { useMe, usePrefs, useUpdateMember, useUpdatePrefs } from "../../data/hooks";
import type { NotificationChannel, NotificationKey, Prefs } from "../../data/types";
import { wantsBirthdayPost } from "../../lib/birthday";
import { BackLink } from "../../components/BackLink";
import { NotificationGroupView } from "../../features/settings/NotificationGroupView";
import { NOTIFICATION_GROUPS } from "../../features/settings/notificationGroups";
import styles from "./SettingsPage.module.css";

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: "both", label: "Email & push" },
  { value: "push", label: "Push only" },
  { value: "email", label: "Email only" },
];

export function SettingsPage() {
  const { me } = useMe();
  const { data: prefs } = usePrefs(me?.id);
  const updatePrefs = useUpdatePrefs();
  const updateMember = useUpdateMember();
  if (!me || !prefs) return null;

  const save = (patch: Partial<Omit<Prefs, "memberId">>) => updatePrefs.mutate({ memberId: me.id, patch });
  const setNotification = (key: NotificationKey, on: boolean) =>
    save({ notifications: { ...prefs.notifications, [key]: on } });

  return (
    <div className={styles.page}>
      <BackLink fallback="/profile" />
      <h1 className={styles.title}>Settings</h1>

      <section className={styles.birthday} aria-label="Birthday celebration">
        <span className={styles.cake} aria-hidden="true">
          <Cake size={20} strokeWidth={1.75} />
        </span>
        <div className={styles.birthdayText}>
          <p className={styles.birthdayTitle} aria-hidden="true">
            Birthday celebration
          </p>
          <p className={styles.helper}>Post a birthday celebration on the feed on my birthday.</p>
        </div>
        <Toggle
          label="Birthday celebration"
          checked={wantsBirthdayPost(me)}
          onChange={(on) => updateMember.mutate({ id: me.id, patch: { birthdayPost: on } })}
        />
      </section>

      <section className={styles.notifications} aria-labelledby="notifications-title">
        <h2 id="notifications-title" className={styles.sectionTitle}>
          Notifications
        </h2>
        <div className={styles.card}>
          <div className={styles.channel}>
            <Eyebrow as="p">How I hear about them</Eyebrow>
            <SegmentedControl
              ariaLabel="How I hear about them"
              options={CHANNEL_OPTIONS}
              value={prefs.channel}
              onChange={(channel) => save({ channel: channel as NotificationChannel })}
            />
            <p className={styles.helper}>Push is set up per device. Check this one is turned on.</p>
          </div>
          {NOTIFICATION_GROUPS.map((group) => (
            <NotificationGroupView
              key={group.title}
              group={group}
              values={prefs.notifications}
              onChange={setNotification}
            />
          ))}
          <p className={styles.footer}>
            <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" className={styles.footerIcon} />
            Cancellations and hosting swaps always reach me.
          </p>
        </div>
      </section>
    </div>
  );
}
