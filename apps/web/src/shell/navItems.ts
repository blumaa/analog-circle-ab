import type { ComponentType } from "react";
import { BookUser, CalendarDays, House } from "lucide-react";
import { CirclesIcon } from "../components/CirclesIcon";

export type IconComponent = ComponentType<{ size?: number; strokeWidth?: number }>;

export interface NavItem {
  label: string;
  to: string;
  icon: IconComponent;
  /** Active only on an exact path match. */
  end?: boolean;
}

/** The four primary destinations: tab bar and Menu sheet. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Home", to: "/", icon: House, end: true },
  { label: "Circles", to: "/circles", icon: CirclesIcon },
  { label: "Calendar", to: "/calendar", icon: CalendarDays },
  { label: "Directory", to: "/directory", icon: BookUser },
];
