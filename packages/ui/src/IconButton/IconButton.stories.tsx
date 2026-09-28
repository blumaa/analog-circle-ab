import type { Meta, StoryObj } from "@storybook/react";
import { Bookmark, EllipsisVertical, Pencil, Pin, SendHorizontal, Trash2 } from "lucide-react";
import { IconButton } from "./IconButton";

const meta = {
  title: "Primitives/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  args: { label: "Menu", icon: <EllipsisVertical size={17} strokeWidth={1.75} /> },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeaderMenu: Story = { args: { shape: "square" } };
export const Pinned: Story = {
  args: { label: "Pinned", variant: "tint", shape: "square", size: 28, icon: <Pin size={14} strokeWidth={1.75} /> },
};
export const BookmarkOff: Story = {
  args: { label: "Bookmark", variant: "ghost", pressed: false, icon: <Bookmark size={18} strokeWidth={1.75} /> },
};
export const BookmarkOn: Story = {
  args: { label: "Bookmark", variant: "ghost", pressed: true, icon: <Bookmark size={18} strokeWidth={1.75} /> },
};
export const Edit: Story = { args: { label: "Edit", size: 32, icon: <Pencil size={14} strokeWidth={1.75} /> } };
export const Delete: Story = {
  args: { label: "Delete", size: 32, variant: "danger", icon: <Trash2 size={14} strokeWidth={1.75} /> },
};
export const Send: Story = {
  args: { label: "Send", size: 26, variant: "gold", icon: <SendHorizontal size={13} strokeWidth={1.75} /> },
};
