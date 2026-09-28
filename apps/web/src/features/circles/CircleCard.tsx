import { Link } from "react-router-dom";
import { AvatarStack, TypeTag } from "@analog/ui";
import type { Circle, Member } from "../../data/types";
import { CIRCLE_TYPE_LABEL, memberCount } from "../../lib/circles";
import { CircleTree } from "./CircleTree";
import styles from "./CircleCard.module.css";

export interface CircleCardProps {
  circle: Circle;
  members: Member[];
}

/** Whole card is one link to the circle detail (stretched link). */
export function CircleCard({ circle, members }: CircleCardProps) {
  const people = circle.memberIds.slice(0, 3).flatMap((id) => {
    const m = members.find((x) => x.id === id);
    return m ? [{ name: m.name, src: m.photoUrl }] : [];
  });
  return (
    <article aria-label={circle.name} className={styles.card}>
      <div className={styles.main}>
        <h2 className={styles.name}>
          <Link to={`/circles/${circle.id}`} className={styles.link}>
            {circle.name}
          </Link>
        </h2>
        {circle.description && <p className={styles.description}>{circle.description}</p>}
        <div className={styles.members}>
          <AvatarStack people={people} max={3} />
          <span>{memberCount(circle.memberIds.length)}</span>
        </div>
      </div>
      <div className={styles.side}>
        <TypeTag className={styles.tag}>{CIRCLE_TYPE_LABEL[circle.type]}</TypeTag>
        <CircleTree imageUrl={circle.imageUrl} size={86} />
      </div>
    </article>
  );
}
