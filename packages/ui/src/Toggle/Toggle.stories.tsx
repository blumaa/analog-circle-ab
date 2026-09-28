import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./Toggle";

const meta = {
  title: "Primitives/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  args: { label: "Reminders" },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const On: Story = { args: { checked: true } };
export const Off: Story = { args: { checked: false } };
export const OffOnSheet: Story = { args: { checked: false, onSheet: true } };
export const Locked: Story = { args: { locked: true } };
export const Interactive: Story = {
  render: (args) => {
    const [on, setOn] = useState(false);
    return <Toggle {...args} checked={on} onChange={setOn} />;
  },
};
