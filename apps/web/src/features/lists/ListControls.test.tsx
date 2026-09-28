import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListControls } from "./ListControls";

describe("ListControls", () => {
  it("groups the list controls so they stay put while the list scrolls", () => {
    render(
      <ListControls label="Feed controls">
        <button type="button">Sort</button>
      </ListControls>,
    );
    const group = screen.getByRole("group", { name: "Feed controls" });
    expect(group).toContainElement(screen.getByRole("button", { name: "Sort" }));
    expect(group.className).toMatch(/controls/);
  });
});
