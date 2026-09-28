import { lazy, Suspense, type ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary, ToastProvider } from "@analog/ui";
import { RequireAdmin } from "./auth/RequireAdmin";
import { RequireAuth } from "./auth/RequireAuth";
import { AppShell } from "./shell/AppShell";
import { PageLoader } from "./shell/PageLoader";

// Route-level code-splitting: each page is its own chunk, loaded on demand.
const page = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })));

const LoginPage = page(() => import("./routes/Login/LoginPage"), "LoginPage");
const HomePage = page(() => import("./routes/Home/HomePage"), "HomePage");
const CirclesPage = page(() => import("./routes/Circles/CirclesPage"), "CirclesPage");
const CircleDetailPage = page(() => import("./routes/CircleDetail/CircleDetailPage"), "CircleDetailPage");
const CalendarPage = page(() => import("./routes/Calendar/CalendarPage"), "CalendarPage");
const DirectoryPage = page(() => import("./routes/Directory/DirectoryPage"), "DirectoryPage");
const ProfilePage = page(() => import("./routes/Profile/ProfilePage"), "ProfilePage");
const SettingsPage = page(() => import("./routes/Settings/SettingsPage"), "SettingsPage");
const EventDetailPage = page(() => import("./routes/EventDetail/EventDetailPage"), "EventDetailPage");
const PostDetailPage = page(() => import("./routes/PostDetail/PostDetailPage"), "PostDetailPage");
const NewPostPage = page(() => import("./routes/PostForm/PostFormPage"), "NewPostPage");
const EditPostPage = page(() => import("./routes/PostForm/PostFormPage"), "EditPostPage");
const AdminLayout = page(() => import("./routes/Admin/AdminLayout"), "AdminLayout");
const AdminCirclesPage = page(() => import("./routes/Admin/AdminCirclesPage"), "AdminCirclesPage");
const AdminMembersPage = page(() => import("./routes/Admin/AdminMembersPage"), "AdminMembersPage");
const AdminMetricsPage = page(() => import("./routes/Admin/AdminMetricsPage"), "AdminMetricsPage");
const AdminFeedbackPage = page(() => import("./routes/Admin/AdminFeedbackPage"), "AdminFeedbackPage");

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
                <Route path="/login" element={<LoginPage />} />
                <Route
                  element={
                    <RequireAuth>
                      <AppShell />
                    </RequireAuth>
                  }
                >
                  <Route path="/" element={<HomePage />} />
                  <Route path="/circles" element={<CirclesPage />} />
                  <Route path="/circles/:id" element={<CircleDetailPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                  <Route path="/directory" element={<DirectoryPage />} />
                  <Route path="/members/:id" element={<ProfilePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/events/:id" element={<EventDetailPage />} />
                  <Route path="/posts/:id" element={<PostDetailPage />} />
                  <Route
                    path="/admin"
                    element={
                      <RequireAdmin>
                        <AdminLayout />
                      </RequireAdmin>
                    }
                  >
                    <Route index element={<Navigate to="circles" replace />} />
                    <Route path="circles" element={<AdminCirclesPage />} />
                    <Route path="members" element={<AdminMembersPage />} />
                    <Route path="metrics" element={<AdminMetricsPage />} />
                    <Route path="feedback" element={<AdminFeedbackPage />} />
                  </Route>
                </Route>
                <Route
                  element={
                    <RequireAuth>
                      <AppShell showTabs={false} />
                    </RequireAuth>
                  }
                >
                  <Route path="/new" element={<NewPostPage />} />
                  <Route path="/posts/:id/edit" element={<EditPostPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </QueryClientProvider>
  );
}
