import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";
import { Input } from "./Input";

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  args: { "aria-label": "Search" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: "Search…" } };
export const WithLeftIcon: Story = {
  args: { placeholder: "Search…", leftIcon: <Search size={16} /> },
};
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };
export const WithValue: Story = { args: { value: "analog.circle", readOnly: true } };

/** Bare variant — Loop search: no background, no border, no radius box */
export const Bare: Story = {
  args: { placeholder: "Search loops…", variant: "bare", leftIcon: <Search size={16} /> },
};
