import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { PageLoader } from "./PageLoader";
import { TabBar } from "./TabBar";
import styles from "./AppShell.module.css";

export interface AppShellProps {
  /** The New and Edit forms hide the tab bar. */
  showTabs?: boolean;
}

/** Mobile frame: sticky header, page, tab bar. Centred 390px column on desktop. */
export function AppShell({ showTabs = true }: AppShellProps) {
  return (
    <div className={styles.frame}>
      <AppHeader />
      <main className={styles.main}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      {showTabs && <TabBar />}
    </div>
  );
}
