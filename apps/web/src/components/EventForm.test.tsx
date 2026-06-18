import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventForm } from "./EventForm";

describe("EventForm", () => {
  it("submits entered values", async () => {
    const onSubmit = vi.fn();
    render(<EventForm groupId="ic4" onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Title"), "Dinner");
    await userEvent.type(screen.getByLabelText("Date"), "2026-09-12");
    await userEvent.click(screen.getByRole("button", { name: /save event/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ title: "Dinner", date: "2026-09-12" });
  });

  it("does not submit without a title", async () => {
    const onSubmit = vi.fn();
    render(<EventForm groupId="ic4" onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole("button", { name: /save event/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("prefills from initial values", () => {
    render(
      <EventForm
        groupId="ic4"
        initial={{ title: "Existing", date: "2026-10-01", scope: "analog" }}
        onSubmit={() => undefined}
      />,
    );
    expect(screen.getByLabelText("Title")).toHaveValue("Existing");
  });
});
