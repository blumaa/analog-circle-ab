import type { Meta, StoryObj } from "@storybook/react";
import { LabeledField } from "./LabeledField";

const meta = {
  title: "Molecules/LabeledField",
  component: LabeledField,
  tags: ["autodocs"],
} satisfies Meta<typeof LabeledField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const From: Story = {
  args: {
    label: "From",
    children: "United States",
  },
};

export const Bio: Story = {
  args: {
    label: "Bio",
    children:
      "A former teacher and current coder who enjoys writing poems, hiking, and a good laugh with friends.",
  },
};

export const Interests: Story = {
  args: {
    label: "Interests",
    children: "Design systems · Padel · Hiking · Poetry",
  },
};
