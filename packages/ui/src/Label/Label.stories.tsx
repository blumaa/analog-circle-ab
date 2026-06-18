import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./Label";

const meta = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  args: { children: "Coming up" },
  argTypes: {
    as: { control: "inline-radio", options: ["span", "div"] },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComingUp: Story = { args: { children: "Coming up" } };
export const When: Story = { args: { children: "When" } };
export const Address: Story = { args: { children: "Address" } };
export const AsDiv: Story = { args: { as: "div", children: "Coming up" } };
