import { NavLink } from "react-router-dom";
import { useNavItems } from "./navItems";
import styles from "./BottomNav.module.css";

/** Mobile sticky bottom tab bar. Renders the shared primary-nav items. */
export function BottomNav() {
  const items = useNavItems();

  return (
    <nav className={styles.nav} aria-label="Inner Circle">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          end={item.exact}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
