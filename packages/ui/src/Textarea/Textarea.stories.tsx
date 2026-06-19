import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { "aria-label": "Notes" },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: "Write something…" } };

export const WithLabel: Story = {
  args: { label: "Biography", placeholder: "Tell us about yourself…" },
};

export const NoResize: Story = {
  args: { label: "Fixed height", resize: "none", rows: 6 },
};

export const Disabled: Story = {
  args: { label: "Disabled", placeholder: "Unavailable", disabled: true },
};
