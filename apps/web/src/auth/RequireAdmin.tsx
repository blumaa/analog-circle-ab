import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useMe } from "../data/hooks";
import { isAdmin } from "../lib/permissions";
import { PageLoader } from "../shell/PageLoader";

/** Gate for admin pages. Members go home. Sits inside RequireAuth. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { me, isLoading } = useMe();
  if (isLoading) return <PageLoader />;
  if (!isAdmin(me)) return <Navigate to="/" replace />;
  return children;
}
