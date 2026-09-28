import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ListGroup, ListRow } from "./ListGroup";

describe("ListGroup", () => {
  it("renders rows as list items", () => {
    render(
      <ListGroup aria-label="Pages">
        <ListRow label="Home" />
        <ListRow label="Circles" />
      </ListGroup>,
    );
    expect(screen.getByRole("list", { name: "Pages" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("clickable row is a button", async () => {
    const onClick = vi.fn();
    render(
      <ListGroup>
        <ListRow label="Profile" onClick={onClick} />
      </ListGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Profile" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("static row has no button", () => {
    render(
      <ListGroup>
        <ListRow label="Inactive" value={10} />
      </ListGroup>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("marks highlighted rows", () => {
    render(
      <ListGroup>
        <ListRow label="Most active" highlighted />
      </ListGroup>,
    );
    expect(screen.getByRole("listitem")).toHaveAttribute("data-highlighted", "true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <ListGroup aria-label="Pages">
        <ListRow label="Home" onClick={() => {}} />
        <ListRow label="Count" value={3} />
      </ListGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("link row is an anchor; external links open in a new tab", () => {
    render(
      <ListGroup aria-label="Contact">
        <ListRow label="Email" value="ada@example.com" href="mailto:ada@example.com" />
        <ListRow label="Social" href="https://instagram.com/ada" external />
      </ListGroup>,
    );
    expect(screen.getByRole("link", { name: /Email/ })).toHaveAttribute("href", "mailto:ada@example.com");
    const social = screen.getByRole("link", { name: /Social/ });
    expect(social).toHaveAttribute("target", "_blank");
    expect(social).toHaveAttribute("rel", "noreferrer");
  });

  it("plain icons skip the tile", () => {
    const { container } = render(
      <ListGroup>
        <ListRow label="Email" icon={<span>@</span>} iconStyle="plain" />
      </ListGroup>,
    );
    expect(container.querySelector("[data-icon-style='plain']")).not.toBeNull();
  });
});
