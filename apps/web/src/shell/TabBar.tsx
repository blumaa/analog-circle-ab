import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navItems";
import styles from "./TabBar.module.css";

export function TabBar() {
  return (
    <nav className={styles.bar} aria-label="Main">
      <ul className={styles.list}>
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={styles.tab}>
              <Icon size={24} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
