import { NavLink, Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const SECTIONS = [
  { to: "/admin/circles", label: "Circles" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/metrics", label: "Metrics" },
  { to: "/admin/feedback", label: "Feedback" },
] as const;

/** Admin hub: section switcher above the current admin page. */
export function AdminLayout() {
  return (
    <>
      <nav className={styles.nav} aria-label="Admin">
        <ul className={styles.list}>
          {SECTIONS.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className={styles.link}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </>
  );
}
