import type { Meta, StoryObj } from "@storybook/react";
import { TypeTag } from "./TypeTag";

const meta = {
  title: "Primitives/TypeTag",
  component: TypeTag,
  tags: ["autodocs"],
  args: { children: "Event · My Circle" },
} satisfies Meta<typeof TypeTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gold: Story = {};
export const Green: Story = { args: { tone: "green", children: "Offer" } };
export const Pink: Story = { args: { tone: "pink", children: "Birthday" } };
