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
  { value: "any", label: "Any time" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

export const Default: Story = {
  args: {
    options,
    value: "week",
    onChange: () => {},
    ariaLabel: "Date",
  },
};

export const Interactive: Story = {
  args: {
    options,
    value: "week",
    onChange: () => {},
    ariaLabel: "Date",
  },
  render: () => {
    const [value, setValue] = useState("week");
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

export const Solid: Story = {
  args: {
    options: [
      { value: "date", label: "I know the date" },
      { value: "poll", label: "Let the group pick" },
    ],
    value: "date",
    onChange: () => {},
    ariaLabel: "When",
    variant: "solid",
  },
};
