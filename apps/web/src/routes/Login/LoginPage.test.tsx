import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ToastProvider } from "@analog/ui";
import { LoginPage } from "./LoginPage";

function renderLogin() {
  const qc = new QueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter initialEntries={["/innercircle/login"]}>
          <LoginPage />
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe("LoginPage", () => {
  it("renders the email sign-in form", () => {
    renderLogin();
    expect(screen.getByRole("heading", { name: /sign in with email/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /email sign-in link/i })).toBeInTheDocument();
  });

  it("offers a dev sign-in shortcut", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: /dev sign-in/i })).toBeInTheDocument();
  });
});
