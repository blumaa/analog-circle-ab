import { useInnerGroup, useCurrentMemberId } from "../data/hooks";

/** A single primary-navigation destination rendered by the BottomNav. */
export interface NavItem {
  /** Visible link text. */
  label: string;
  /** Route path. */
  to: string;
  /**
   * When true, the link is only active on an exact path match (NavLink `end`).
   * Used for "Home" so it doesn't stay highlighted on nested routes.
   */
  exact?: boolean;
}

/**
 * Single source of truth for the primary nav destinations.
 *
 * The BottomNav renders from this list. "Your Circle" depends on the member's inner
 * group, which is why this is a hook rather than a static constant.
 */
export function useNavItems(): NavItem[] {
  const { data: memberId } = useCurrentMemberId();
  const { data: innerGroup } = useInnerGroup(memberId);

  return [
    { label: "Home", to: "/innercircle/dashboard", exact: true },
    { label: "The Square", to: "/innercircle/calendar" },
    { label: "The Loop", to: "/innercircle/the-loop" },
    {
      label: "Your Circle",
      to: innerGroup ? `/innercircle/group/${innerGroup.id}` : "/innercircle/dashboard",
    },
    { label: "Directory", to: "/innercircle/members" },
    { label: "Profile", to: "/innercircle/profile" },
  ];
}
