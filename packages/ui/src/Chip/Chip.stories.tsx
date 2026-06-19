import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from "./Chip";

const meta = {
  title: "Primitives/Chip",
  component: Chip,
  tags: ["autodocs"],
  args: { children: "Offers" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = { args: { selected: true } };
export const WithCount: Story = { args: { count: 7 } };
export const SelectedWithCount: Story = { args: { selected: true, count: 7 } };
export const Static: Story = { args: { static: true, children: "Hiking" } };
export const RoseTone: Story = { args: { tone: "rose", children: "Need" } };
export const RoseToneSelected: Story = { args: { tone: "rose", selected: true, children: "Need" } };
export const RoseToneStatic: Story = { args: { static: true, tone: "rose", children: "Offer" } };
