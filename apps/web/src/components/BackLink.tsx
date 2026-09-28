import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGoBack } from "./useGoBack";
import styles from "./BackLink.module.css";

export interface BackLinkProps {
  /** Where to go when there's no in-app history, e.g. after opening a shared link. */
  fallback: string;
}

/** An arrow named "Back". Goes back when the user navigated here in-app, otherwise to the fallback. */
export function BackLink({ fallback }: BackLinkProps) {
  const { hasHistory, goBack } = useGoBack(fallback);
  return (
    <Link
      to={fallback}
      className={styles.back}
      aria-label="Back"
      onClick={(e) => {
        if (!hasHistory) return;
        e.preventDefault();
        goBack();
      }}
    >
      <ArrowLeft size={20} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}
