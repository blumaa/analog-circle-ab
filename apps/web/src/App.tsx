import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary, ToastProvider } from "@analog/ui";
import { AppLayout } from "./AppLayout";
import { RequireAuth } from "./auth/RequireAuth";
import { PageLoader } from "./components/PageLoader";

// Route-level code-splitting: each page is its own chunk, loaded on demand.
const LoginPage = lazy(() => import("./routes/Login/LoginPage").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("./routes/Dashboard/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const TheLoopPage = lazy(() => import("./routes/TheLoop/TheLoopPage").then((m) => ({ default: m.TheLoopPage })));
const YourCirclePage = lazy(() => import("./routes/YourCircle/YourCirclePage").then((m) => ({ default: m.YourCirclePage })));
const CalendarPage = lazy(() => import("./routes/Calendar/CalendarPage").then((m) => ({ default: m.CalendarPage })));
const EventDetailPage = lazy(() => import("./routes/EventDetail/EventDetailPage").then((m) => ({ default: m.EventDetailPage })));
const MembersPage = lazy(() => import("./routes/Members/MembersPage").then((m) => ({ default: m.MembersPage })));
const MemberProfilePage = lazy(() => import("./routes/MemberProfile/MemberProfilePage").then((m) => ({ default: m.MemberProfilePage })));
const ProfilePage = lazy(() => import("./routes/Profile/ProfilePage").then((m) => ({ default: m.ProfilePage })));

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/innercircle/login" element={<LoginPage />} />
                <Route
                  element={
                    <RequireAuth>
                      <AppLayout />
                    </RequireAuth>
                  }
                >
                  <Route path="/innercircle/dashboard" element={<DashboardPage />} />
                  <Route path="/innercircle/calendar" element={<CalendarPage />} />
                  <Route path="/innercircle/event/:id" element={<EventDetailPage />} />
                  <Route path="/innercircle/the-loop" element={<TheLoopPage />} />
                  <Route path="/innercircle/group/:id" element={<YourCirclePage />} />
                  <Route path="/innercircle/members" element={<MembersPage />} />
                  <Route path="/innercircle/members/:id" element={<MemberProfilePage />} />
                  <Route path="/innercircle/profile" element={<ProfilePage />} />
                </Route>
                <Route path="*" element={<Navigate to="/innercircle/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
