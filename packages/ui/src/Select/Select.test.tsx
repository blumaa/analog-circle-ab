import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Select } from "./Select";

const OPTIONS = [
  { value: "guitar", label: "Guitar" },
  { value: "synth", label: "Synth" },
  { value: "drums", label: "Drums" },
];

describe("Select", () => {
  it("renders a combobox", () => {
    render(<Select aria-label="Instrument" options={OPTIONS} value="guitar" onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders all options", () => {
    render(<Select aria-label="Instrument" options={OPTIONS} value="guitar" onChange={() => {}} />);
    expect(screen.getByRole("option", { name: "Guitar" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Synth" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Drums" })).toBeInTheDocument();
  });

  it("reflects the controlled value", () => {
    render(<Select aria-label="Instrument" options={OPTIONS} value="synth" onChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveValue("synth");
  });

  it("calls onChange with the selected value", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Instrument" options={OPTIONS} value="guitar" onChange={onChange} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "drums");
    expect(onChange).toHaveBeenCalledWith("drums");
  });

  it("renders a disabled placeholder option when provided", () => {
    render(
      <Select
        aria-label="Instrument"
        options={OPTIONS}
        value=""
        onChange={() => {}}
        placeholder="Pick one…"
      />,
    );
    const option = screen.getByRole("option", { name: "Pick one…" });
    expect(option).toBeInTheDocument();
    expect(option).toBeDisabled();
  });

  it("forwards the ref to the select element", () => {
    const ref = { current: null as HTMLSelectElement | null };
    render(
      <Select aria-label="Instrument" options={OPTIONS} value="guitar" onChange={() => {}} ref={ref} />,
    );
    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
  });

  it("renders a label element when label prop is provided", () => {
    render(<Select label="Instrument" options={OPTIONS} value="guitar" onChange={() => {}} />);
    expect(screen.getByText("Instrument").tagName).toBe("LABEL");
  });

  it("associates the label with the select via htmlFor/id", () => {
    render(<Select label="Instrument" options={OPTIONS} value="guitar" onChange={() => {}} />);
    const label = screen.getByText("Instrument");
    const select = screen.getByRole("combobox");
    expect(label).toHaveAttribute("for", select.id);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <Select aria-label="Instrument" options={OPTIONS} value="guitar" onChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations with label and placeholder", async () => {
    const { container } = render(
      <Select
        label="Instrument"
        options={OPTIONS}
        value=""
        onChange={() => {}}
        placeholder="Pick one…"
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
