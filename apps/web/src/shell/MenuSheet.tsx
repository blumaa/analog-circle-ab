import { useNavigate } from "react-router-dom";
import { LogOut, MessageSquarePlus, Settings, ShieldCheck, User } from "lucide-react";
import { Avatar, BottomSheet, ListGroup, ListRow } from "@analog/ui";
import { useCircles, useMe, useSignOut } from "../data/hooks";
import { innerCircleLabel } from "../lib/circles";
import { firstName } from "../lib/names";
import { isAdmin } from "../lib/permissions";
import { NAV_ITEMS } from "./navItems";
import styles from "./MenuSheet.module.css";

const ICON = { size: 18, strokeWidth: 1.75 } as const;

export interface MenuSheetProps {
  open: boolean;
  onClose: () => void;
  /** Opens the feedback sheet. */
  onFeedback: () => void;
}

export function MenuSheet({ open, onClose, onFeedback }: MenuSheetProps) {
  const navigate = useNavigate();
  const { me } = useMe();
  const { data: circles = [] } = useCircles();
  const signOut = useSignOut();
  if (!me) return null;

  const go = (to: string) => {
    onClose();
    navigate(to);
  };
  const meta = [innerCircleLabel(circles, me.id), "Berlin"].filter(Boolean).join(" · ");

  return (
    <BottomSheet open={open} onClose={onClose} ariaLabel="Menu">
      <div className={styles.user}>
        <Avatar name={me.name} src={me.photoUrl} size={46} decorative />
        <div>
          <p className={styles.name}>{firstName(me.name)}</p>
          <p className={styles.meta}>{meta}</p>
        </div>
      </div>
      <ListGroup aria-label="You">
        <ListRow label="Profile" icon={<User {...ICON} />} onClick={() => go("/profile")} />
        <ListRow label="Settings" icon={<Settings {...ICON} />} onClick={() => go("/settings")} />
      </ListGroup>
      <ListGroup aria-label="Pages">
        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <ListRow key={to} label={label} icon={<Icon {...ICON} />} onClick={() => go(to)} />
        ))}
      </ListGroup>
      {isAdmin(me) && (
        <ListGroup aria-label="Admin">
          <ListRow label="Admin" icon={<ShieldCheck {...ICON} />} onClick={() => go("/admin")} />
        </ListGroup>
      )}
      <ListGroup aria-label="More">
        <ListRow label="Give feedback" icon={<MessageSquarePlus {...ICON} />} onClick={onFeedback} />
        <ListRow
          label="Sign out"
          icon={<LogOut {...ICON} />}
          onClick={() => signOut.mutate(undefined, { onSuccess: () => go("/login") })}
        />
      </ListGroup>
    </BottomSheet>
  );
}
