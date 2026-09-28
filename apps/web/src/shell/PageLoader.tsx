import { Spinner } from "@analog/ui";
import styles from "./PageLoader.module.css";

export function PageLoader() {
  return (
    <div className={styles.loader}>
      <Spinner label="Loading" />
    </div>
  );
}
