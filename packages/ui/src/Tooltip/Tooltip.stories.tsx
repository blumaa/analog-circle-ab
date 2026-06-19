import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { Tooltip } from "./Tooltip";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: "Liked by Vki, Kasey",
    children: <Button variant="outline">Hover or focus me</Button>,
  },
};

export const RichContent: Story = {
  args: {
    content: (
      <div style={{ display: "grid", gap: "0.25rem" }}>
        <strong>Liked by</strong>
        <span>Vki</span>
        <span>Kasey</span>
      </div>
    ),
    children: <Button variant="ghost">Show likers</Button>,
  },
};
