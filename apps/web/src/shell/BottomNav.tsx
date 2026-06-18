import { NavLink } from "react-router-dom";
import { useInnerGroup, useCurrentMemberId } from "../data/hooks";
import styles from "./BottomNav.module.css";

interface NavItem {
  label: string;
  to: string;
}

/** Mobile-first bottom tab bar; on desktop it sits centered under the container. */
export function BottomNav() {
  const { data: memberId } = useCurrentMemberId();
  const { data: innerGroup } = useInnerGroup(memberId);

  const items: NavItem[] = [
    { label: "Home", to: "/innercircle/dashboard" },
    { label: "Calendar", to: "/innercircle/calendar" },
    { label: "The Loop", to: "/innercircle/the-loop" },
    {
      label: "Your Circle",
      to: innerGroup ? `/innercircle/group/${innerGroup.id}` : "/innercircle/dashboard",
    },
    { label: "Profile", to: "/innercircle/profile" },
  ];

  return (
    <nav className={styles.nav} aria-label="Inner Circle">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          end
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
