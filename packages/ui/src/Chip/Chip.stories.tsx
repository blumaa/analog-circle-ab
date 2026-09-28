import type { Meta, StoryObj } from "@storybook/react";
import { Bookmark } from "lucide-react";
import { Chip } from "./Chip";

const meta = {
  title: "Primitives/Chip",
  component: Chip,
  tags: ["autodocs"],
  args: { children: "My Circle" },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ToggleSelected: Story = { args: { selected: true } };
export const SingleSelected: Story = { args: { selected: true, selectStyle: "single", children: "All" } };
export const WithIcon: Story = { args: { icon: <Bookmark size={14} />, children: undefined, "aria-label": "Favourites" } };
export const Static: Story = { args: { static: true, children: "Berlin" } };
