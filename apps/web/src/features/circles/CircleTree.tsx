import { CirclesIcon } from "../../components/CirclesIcon";
import styles from "./CircleTree.module.css";

export interface CircleTreeProps {
  imageUrl: string | null;
  /** Height in px: 86 on cards, 130 on the detail hero, 180 on metrics. */
  size: 86 | 130 | 180;
}

/** The circle's tree picture, or a drawn placeholder. Decorative. */
export function CircleTree({ imageUrl, size }: CircleTreeProps) {
  return (
    <div className={styles.tree} data-size={size}>
      {imageUrl ? (
        <img src={imageUrl} alt="" className={styles.image} />
      ) : (
        <CirclesIcon size={size / 2} strokeWidth={1.25} />
      )}
    </div>
  );
}
