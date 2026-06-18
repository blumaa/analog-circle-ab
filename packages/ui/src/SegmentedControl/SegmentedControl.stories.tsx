import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const meta = {
  title: "Primitives/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

const options = [
  { value: "all", label: "All", count: 12 },
  { value: "needs", label: "Needs", count: 4 },
  { value: "offers", label: "Offers", count: 8 },
  { value: "archived", label: "Archived", count: 2 },
];

export const Default: Story = {
  args: {
    options,
    value: "all",
    onChange: () => {},
    ariaLabel: "Filter posts",
  },
};

export const Interactive: Story = {
  args: {
    options,
    value: "all",
    onChange: () => {},
    ariaLabel: "Filter posts",
  },
  render: () => {
    const [value, setValue] = useState("all");
    return (
      <SegmentedControl
        options={options}
        value={value}
        onChange={setValue}
        ariaLabel="Filter posts"
      />
    );
  },
};
