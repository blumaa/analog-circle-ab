import type { Meta, StoryObj } from "@storybook/react";
import { Pencil, Plus } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Create" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { leftIcon: <Plus size={16} />, children: "New circle" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Clear" } };
export const Outline: Story = { args: { variant: "outline", children: "Cancel" } };
export const Tint: Story = { args: { variant: "tint", size: "sm", children: "RSVP" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const Cta: Story = { args: { size: "lg", fullWidth: true, leftIcon: <Pencil size={16} />, children: "Edit profile" } };
