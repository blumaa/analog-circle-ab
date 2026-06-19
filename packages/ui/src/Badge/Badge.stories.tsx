import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Neutral" },
  argTypes: {
    variant: {
      control: "select",
      options: ["danger", "offer", "event", "accent", "neutral", "success", "rose"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = { args: { variant: "danger", children: "Need" } };
export const Offer: Story = { args: { variant: "offer", children: "Offer" } };
export const Event: Story = { args: { variant: "event", children: "Event" } };
export const Accent: Story = { args: { variant: "accent", children: "Hosting" } };
export const Neutral: Story = { args: { variant: "neutral", children: "Neutral" } };
export const Success: Story = { args: { variant: "success", children: "Going" } };
export const Rose: Story = { args: { variant: "rose", children: "Need" } };
