import type { Meta, StoryObj } from "@storybook/react";
import { BottomSheet } from "./BottomSheet";

const meta = {
  title: "Primitives/BottomSheet",
  component: BottomSheet,
  tags: ["autodocs"],
  args: { open: true, onClose: () => {}, title: "Sort by", children: <p>Sheet content</p> },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: { title: "Filters", action: <button type="button">Reset</button> },
};
export const Untitled: Story = { args: { title: undefined, ariaLabel: "Menu" } };
