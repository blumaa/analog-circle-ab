import { useState } from "react";
import { Link, useMatch } from "react-router-dom";
import { Bell, EllipsisVertical } from "lucide-react";
import { Avatar, IconButton } from "@analog/ui";
import { useActivity, useMe } from "../data/hooks";
import { unreadCount } from "../lib/activityText";
import { firstName } from "../lib/names";
import logo from "../assets/tac-logo.png";
import { FeedbackSheet } from "./FeedbackSheet";
import { MenuSheet } from "./MenuSheet";
import { NotificationsSheet } from "./NotificationsSheet";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  const { me } = useMe();
  const { data: activity = [] } = useActivity();
  const onHome = useMatch("/") !== null;
  const [sheet, setSheet] = useState<"menu" | "notifications" | "feedback" | null>(null);
  const close = () => setSheet(null);
  const unread = me ? unreadCount(activity, me.id) : 0;

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="The Analog Circle, home">
        <img src={logo} alt="" className={styles.logo} />
        <span className={styles.brandText}>
          <span className={styles.wordmark}>The Analog Circle</span>
          {onHome && <span className={styles.city}>Berlin</span>}
        </span>
      </Link>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.bell}
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          onClick={() => setSheet("notifications")}
        >
          <Bell size={21} strokeWidth={1.75} aria-hidden="true" />
          {unread > 0 && <span className={styles.dot} aria-hidden="true" />}
        </button>
        {me && (
          <Link to="/profile" className={styles.me}>
            <span className={styles.name}>{firstName(me.name)}</span>
            <Avatar name={me.name} src={me.photoUrl} size={30} decorative />
          </Link>
        )}
        <IconButton
          label="Menu"
          shape="square"
          size={30}
          icon={<EllipsisVertical size={17} strokeWidth={1.75} />}
          onClick={() => setSheet("menu")}
        />
      </div>
      <MenuSheet open={sheet === "menu"} onClose={close} onFeedback={() => setSheet("feedback")} />
      <NotificationsSheet open={sheet === "notifications"} onClose={close} />
      <FeedbackSheet open={sheet === "feedback"} onClose={close} />
    </header>
  );
}
