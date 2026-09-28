import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ListToolbar } from "./ListToolbar";
import { SortSheet, type SortOption } from "./SortSheet";
import { FilterSheet } from "./FilterSheet";
import { ChipGroup } from "./ChipGroup";
import { FilterToggle, FilterToggleGroup } from "./FilterToggle";

describe("ListToolbar", () => {
  it("wires search, view, sort and filter", async () => {
    const user = userEvent.setup();
    const onQuery = vi.fn();
    const onView = vi.fn();
    const onSort = vi.fn();
    const onFilter = vi.fn();
    const { container } = render(
      <ListToolbar
        query=""
        onQuery={onQuery}
        view="cards"
        onView={onView}
        onSort={onSort}
        onFilter={onFilter}
        filterCount={2}
      />,
    );
    await user.type(screen.getByRole("searchbox", { name: "Search" }), "a");
    expect(onQuery).toHaveBeenCalledWith("a");
    await user.click(screen.getByRole("button", { name: "View: cards" }));
    expect(onView).toHaveBeenCalledWith("compact");
    await user.click(screen.getByRole("button", { name: "Sort" }));
    expect(onSort).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Filter, 2 active" }));
    expect(onFilter).toHaveBeenCalled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("omits the view and sort buttons when not wired", () => {
    render(<ListToolbar query="" onQuery={() => {}} onFilter={() => {}} filterCount={0} />);
    expect(screen.queryByRole("button", { name: /View/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sort" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument();
  });

  it("keeps the short placeholder and puts the specific wording in the accessible name", () => {
    render(<ListToolbar query="" onQuery={() => {}} searchLabel="Search members" />);
    expect(screen.getByRole("searchbox", { name: "Search members" })).toHaveAttribute("placeholder", "Search");
  });

  it("omits search when there's no query handler", () => {
    render(<ListToolbar onSort={() => {}} onFilter={() => {}} />);
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sort" })).toBeInTheDocument();
  });
});

type By = "a" | "b";
const OPTIONS: SortOption<By>[] = [
  { value: "a", label: "Alpha", icon: null },
  { value: "b", label: "Beta", icon: null },
];

describe("SortSheet", () => {
  it("changes the sort and closes on Apply", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    function Harness() {
      const [sort, setSort] = useState<{ by: By; order: "asc" | "desc" }>({ by: "a", order: "desc" });
      return (
        <>
          <p>{`${sort.by}-${sort.order}`}</p>
          <SortSheet open onClose={onClose} options={OPTIONS} value={sort} onChange={setSort} />
        </>
      );
    }
    render(<Harness />);
    const dialog = screen.getByRole("dialog", { name: "Sort by" });
    await user.click(within(dialog).getByRole("radio", { name: "Beta" }));
    await user.click(within(dialog).getByRole("button", { name: /Ascending/ }));
    expect(screen.getByText("b-asc")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Apply" }));
    expect(onClose).toHaveBeenCalled();
    expect(await axe(dialog)).toHaveNoViolations();
  });
});

describe("FilterSheet + ChipGroup", () => {
  it("shows the live count, toggles chips and resets", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    const onClose = vi.fn();
    function Harness() {
      const [picked, setPicked] = useState<string[]>([]);
      return (
        <FilterSheet open onClose={onClose} onReset={onReset} resultCount={picked.length * 3}>
          <ChipGroup
            label="Colour"
            options={[
              { value: "red", label: "Red" },
              { value: "blue", label: "Blue" },
            ]}
            selected={picked}
            onChange={setPicked}
          />
        </FilterSheet>
      );
    }
    render(<Harness />);
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    await user.click(within(dialog).getByRole("button", { name: "Red" }));
    expect(within(dialog).getByRole("button", { name: "Red" })).toHaveAttribute("aria-pressed", "true");
    await user.click(within(dialog).getByRole("button", { name: "Show 3 results" }));
    expect(onClose).toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: "Reset" }));
    expect(onReset).toHaveBeenCalled();
  });

  it("uses the singular for one result", () => {
    render(<FilterSheet open onClose={() => {}} onReset={() => {}} resultCount={1}>x</FilterSheet>);
    expect(screen.getByRole("button", { name: "Show 1 result" })).toBeInTheDocument();
  });
});

describe("FilterToggleGroup", () => {
  it("groups the sheet's switches under one label", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterToggleGroup label="Options">
        <FilterToggle label="Favourites only" checked={false} onChange={onChange} />
      </FilterToggleGroup>,
    );
    const group = screen.getByRole("group", { name: "Options" });
    await user.click(within(group).getByRole("switch", { name: "Favourites only" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
