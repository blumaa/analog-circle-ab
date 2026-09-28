import { Chip } from "@analog/ui";
import type { CircleTab } from "../../lib/circleList";
import { CIRCLE_TYPE_LABEL } from "../../lib/circles";
import styles from "./CircleTypeTabs.module.css";

const TABS: CircleTab[] = ["inner", "interest", "location", "all"];

export interface CircleTypeTabsProps {
  value: CircleTab;
  onChange: (tab: CircleTab) => void;
  /** "Inner" instead of "Inner Circles" (admin). */
  short?: boolean;
}

const label = (tab: CircleTab, short: boolean) =>
  tab === "all" ? "All" : short ? CIRCLE_TYPE_LABEL[tab] : `${CIRCLE_TYPE_LABEL[tab]} Circles`;

/** Single-select circle type tabs. They wrap instead of scrolling. */
export function CircleTypeTabs({ value, onChange, short = false }: CircleTypeTabsProps) {
  return (
    <div role="group" aria-label="Circle types" className={styles.tabs}>
      {TABS.map((tab) => (
        <Chip key={tab} selectStyle="single" selected={value === tab} onClick={() => onChange(tab)}>
          {label(tab, short)}
        </Chip>
      ))}
    </div>
  );
}
