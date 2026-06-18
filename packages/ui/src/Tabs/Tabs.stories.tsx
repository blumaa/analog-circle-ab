import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Tabs } from "./Tabs";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const tabs = [
  { value: "calendar", label: "Calendar" },
  { value: "members", label: "Members" },
  { value: "map", label: "Map" },
  { value: "food", label: "Food" },
];

export const Default: Story = {
  args: {
    tabs,
    value: "calendar",
    onChange: () => {},
    ariaLabel: "Page sections",
  },
};

export const Interactive: Story = {
  args: {
    tabs,
    value: "calendar",
    onChange: () => {},
    ariaLabel: "Page sections",
  },
  render: () => {
    const [value, setValue] = useState("calendar");
    return <Tabs tabs={tabs} value={value} onChange={setValue} ariaLabel="Page sections" />;
  },
};
