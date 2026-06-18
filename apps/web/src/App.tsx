import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@analog/ui";
import { AppLayout } from "./AppLayout";
import { RequireAuth } from "./auth/RequireAuth";
import { LoginPage } from "./routes/Login/LoginPage";
import { DashboardPage } from "./routes/Dashboard/DashboardPage";
import { TheLoopPage } from "./routes/TheLoop/TheLoopPage";
import { YourCirclePage } from "./routes/YourCircle/YourCirclePage";
import { CalendarPage } from "./routes/Calendar/CalendarPage";
import { MembersPage } from "./routes/Members/MembersPage";
import { MemberProfilePage } from "./routes/MemberProfile/MemberProfilePage";
import { ProfilePage } from "./routes/Profile/ProfilePage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
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
              <Route path="/innercircle/the-loop" element={<TheLoopPage />} />
              <Route path="/innercircle/group/:id" element={<YourCirclePage />} />
              <Route path="/innercircle/members" element={<MembersPage />} />
              <Route path="/innercircle/members/:id" element={<MemberProfilePage />} />
              <Route path="/innercircle/profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/innercircle/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
