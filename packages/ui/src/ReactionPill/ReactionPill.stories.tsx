import type { Meta, StoryObj } from "@storybook/react";
import { ReactionPill } from "./ReactionPill";

const meta = {
  title: "Primitives/ReactionPill",
  component: ReactionPill,
  tags: ["autodocs"],
  args: { children: "🎉 4" },
} satisfies Meta<typeof ReactionPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Footer: Story = {};
export const Active: Story = { args: { active: true } };
export const Comment: Story = { args: { size: 22, children: "❤️ 2" } };
export const Detail: Story = { args: { size: 30 } };
