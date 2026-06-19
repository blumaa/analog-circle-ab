import type { Member } from "../data";
import styles from "./FoodList.module.css";

/** Allergies and dietary notes shared by inner-circle members. */
export function FoodList({ members }: { members: Member[] }) {
  return (
    <div className={styles.wrapper}>
      <p className={styles.intro}>
        Allergies and dietary notes shared by members in this Inner Circle.
      </p>
      <ul className={styles.list}>
        {members.map((m) => (
          <li key={m.id} className={styles.card}>
            <span className={styles.name}>{m.name}</span>
            <span className={styles.note}>{m.dietary?.trim() ? m.dietary : "-"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
