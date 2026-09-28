import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Aaron" },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: 20 } };
export const Large: Story = { args: { size: 92 } };
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Avatar name="Aaron" tone={1} />
      <Avatar name="Náthaly" tone={2} />
      <Avatar name="Odette" tone={3} />
      <Avatar name="Maryam" tone={4} />
    </div>
  ),
};
