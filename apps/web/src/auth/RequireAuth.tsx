import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentMemberId } from "../data/hooks";
import { PageLoader } from "../shell/PageLoader";

/** Gate for member pages. Sends signed-out visitors to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { data: memberId, isLoading } = useCurrentMemberId();
  if (isLoading) return <PageLoader />;
  if (!memberId) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
