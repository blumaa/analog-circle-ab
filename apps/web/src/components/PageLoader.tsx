import { Spinner } from "@analog/ui";
import styles from "./PageLoader.module.css";

/** Centered spinner shown as the Suspense fallback while a lazy chunk loads. */
export function PageLoader() {
  return (
    <div className={styles.loader} role="status" aria-label="Loading">
      <Spinner />
    </div>
  );
}
