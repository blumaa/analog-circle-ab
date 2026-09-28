import { useLocation, useNavigate } from "react-router-dom";

/**
 * Goes back when the user navigated here in-app, otherwise to the fallback
 * (e.g. after opening a shared link).
 */
export function useGoBack(fallback: string) {
  const location = useLocation();
  const navigate = useNavigate();
  // React Router gives the first location of a session the key "default".
  const hasHistory = location.key !== "default";
  return { hasHistory, goBack: () => (hasHistory ? navigate(-1) : navigate(fallback)) };
}
