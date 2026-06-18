import { Outlet } from "react-router-dom";
import { TopBar } from "./shell/TopBar";
import { BottomNav } from "./shell/BottomNav";
import styles from "./AppLayout.module.css";

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <div className={styles.topWrap}>
        <div className={styles.container}>
          <TopBar />
        </div>
      </div>
      <main className={styles.container}>
        <Outlet />
      </main>
      <div className={styles.navWrap}>
        <BottomNav />
      </div>
    </div>
  );
}
