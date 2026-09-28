import type { Meta, StoryObj } from "@storybook/react";
import { Eyebrow } from "./Eyebrow";

const meta = {
  title: "Primitives/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
  args: { children: "Publish to" },
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Section: Story = {};
export const Kicker: Story = { args: { tone: "gold", size: 10, children: "Admin" } };
