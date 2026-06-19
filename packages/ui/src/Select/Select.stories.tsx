import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select } from "./Select";

const OPTIONS = [
  { value: "guitar", label: "Guitar" },
  { value: "synth", label: "Synth" },
  { value: "drums", label: "Drums" },
];

function ControlledSelect(args: Parameters<typeof Select>[0]) {
  const [value, setValue] = useState(args.placeholder ? "" : OPTIONS[0]?.value ?? "");
  return <Select {...args} value={value} onChange={setValue} />;
}

const meta = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    "aria-label": "Instrument",
    options: OPTIONS,
    // Stories render a controlled wrapper, so these are placeholders that the
    // wrapper overrides — they only satisfy Select's required prop contract.
    value: "",
    onChange: () => {},
  },
  render: (args) => <ControlledSelect {...args} />,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: "Instrument" },
};

export const WithPlaceholder: Story = {
  args: { label: "Instrument", placeholder: "Choose an instrument…" },
};
