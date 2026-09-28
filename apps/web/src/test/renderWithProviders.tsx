import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "@analog/ui";

export interface RenderOptions {
  initialEntries?: string[];
  /** Route pattern the UI mounts at, so useParams works, e.g. "/events/:id". */
  path?: string;
}

export function renderWithProviders(ui: ReactNode, { initialEntries = ["/"], path }: RenderOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <ToastProvider>
          {path ? (
            <Routes>
              <Route path={path} element={ui} />
              <Route path="*" element={<p>Navigated away</p>} />
            </Routes>
          ) : (
            ui
          )}
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
