import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Popover } from "./Popover";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: "Example panel",
    trigger: <Button variant="outline">Open popover</Button>,
    children: (
      <div style={{ display: "grid", gap: "0.5rem" }}>
        <strong>Popover panel</strong>
        <span>Anchored beneath the trigger. Closes on outside click or Esc.</span>
      </div>
    ),
  },
};

export const AlignStart: Story = {
  args: {
    ...Default.args,
    align: "start",
  },
};
