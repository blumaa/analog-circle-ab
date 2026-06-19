import type { Meta, StoryObj } from "@storybook/react";
import { Plus } from "lucide-react";
import { Fab } from "./Fab";

const meta = {
  title: "Primitives/Fab",
  component: Fab,
  tags: ["autodocs"],
} satisfies Meta<typeof Fab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <Plus size={24} />,
    "aria-label": "New event",
  },
};
