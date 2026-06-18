import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentMemberId } from "../data/hooks";

/**
 * Gate for /innercircle/* routes. Redirects to login when no session.
 * The mock seeds a signed-in persona, so dev never bounces; real magic-link
 * + dev-bypass sign-in arrive with the Login UI once primitives exist.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { data: memberId, isLoading } = useCurrentMemberId();
  if (isLoading) return null;
  if (!memberId) return <Navigate to="/innercircle/login" replace />;
  return children;
}
