import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { TopBar } from "./shell/TopBar";
import { BottomNav } from "./shell/BottomNav";
import { PageLoader } from "./components/PageLoader";
import styles from "./AppLayout.module.css";

/**
 * App shell: full-width sticky TopBar, centered single-column content, sticky BottomNav.
 * Matches the live site, which is a centered single column at all widths (the header bar
 * spans full width; the content is centered).
 */
export function AppLayout() {
  return (
    <div className={styles.shell}>
      <div className={styles.topWrap}>
        <div className={styles.topInner}>
          <TopBar />
        </div>
      </div>
      <main className={styles.container}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <div className={styles.navWrap}>
        <BottomNav />
      </div>
    </div>
  );
}
