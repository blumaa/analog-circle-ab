import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Menu, X } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Email sign-in link" },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "success", "danger", "whatsapp", "soft"],
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Secondary action" } };
export const Outline: Story = { args: { variant: "outline", children: "Add to calendar" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Propose hosting swap" } };
export const Success: Story = { args: { variant: "success", children: "WhatsApp" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const WithIcon: Story = {
  args: { variant: "outline", leftIcon: <Calendar size={16} />, children: "Add to calendar" },
};
export const FullWidth: Story = { args: { fullWidth: true } };
export const Disabled: Story = { args: { disabled: true } };
export const IconOnly: Story = {
  args: { iconOnly: true, "aria-label": "Open menu", variant: "outline", children: <Menu size={20} /> },
};
export const IconOnlyGhost: Story = {
  args: { iconOnly: true, "aria-label": "Close", variant: "ghost", children: <X size={20} /> },
};
export const OutlineGold: Story = { args: { variant: "outline", children: "Add to The Loop" } };
export const Soft: Story = { args: { variant: "soft", children: "Download .ics" } };
