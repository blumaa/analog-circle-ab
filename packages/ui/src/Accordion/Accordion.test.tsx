import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Accordion } from "./Accordion";

describe("Accordion", () => {
  it("renders the summary as the button accessible name", () => {
    render(
      <Accordion summary="Attendance — 5 of 7 going">
        <p>Details</p>
      </Accordion>,
    );
    expect(
      screen.getByRole("button", { name: /Attendance — 5 of 7 going/ }),
    ).toBeInTheDocument();
  });

  it("is collapsed by default", () => {
    render(
      <Accordion summary="RSVP — You're going">
        <p>Details</p>
      </Accordion>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });

  it("respects defaultOpen", () => {
    render(
      <Accordion summary="RSVP — You're going" defaultOpen>
        <p>Details</p>
      </Accordion>,
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Details")).toBeVisible();
  });

  it("toggles open and closed when clicked", async () => {
    render(
      <Accordion summary="RSVP — You're going">
        <p>Details</p>
      </Accordion>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("links the button to the content via aria-controls", () => {
    render(
      <Accordion summary="RSVP — You're going" defaultOpen>
        <p>Details</p>
      </Accordion>,
    );
    const button = screen.getByRole("button");
    const controlled = button.getAttribute("aria-controls");
    expect(controlled).toBeTruthy();
    expect(document.getElementById(controlled as string)).toBeInTheDocument();
  });

  it("renders the trailing node", () => {
    render(
      <Accordion summary="RSVP" trailing={<span>You're going</span>}>
        <p>Details</p>
      </Accordion>,
    );
    expect(screen.getByText("You're going")).toBeInTheDocument();
  });

  it("keeps a long summary readable alongside a trailing node", () => {
    render(
      <Accordion
        summary="Inner Circle meeting — a long title that should wrap naturally rather than being crushed"
        trailing={<span>Sat 14 Jun · You&apos;re hosting</span>}
      >
        <p>Details</p>
      </Accordion>,
    );
    expect(
      screen.getByRole("button", { name: /Inner Circle meeting/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(/You're hosting/)).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Accordion summary="Attendance — 5 of 7 going" defaultOpen>
        <p>Details</p>
      </Accordion>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
