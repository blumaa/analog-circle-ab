import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./Avatar";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Alice Johnson" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    shape: { control: "inline-radio", options: ["circle", "rounded"] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPhoto: Story = {
  args: { src: "https://i.pravatar.cc/150?img=1" },
};
export const InitialsFallback: Story = {};
export const NullSrc: Story = { args: { src: null } };
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };

export const RoundedPortrait: Story = {
  args: { shape: "rounded", src: "https://i.pravatar.cc/300?img=5", aspect: "1 / 1" },
  decorators: [
    (Story) => (
      <div style={{ width: 220 }}>
        <Story />
      </div>
    ),
  ],
};

export const RoundedInitials: Story = {
  args: { shape: "rounded", src: null, aspect: "1 / 1" },
  decorators: [
    (Story) => (
      <div style={{ width: 220 }}>
        <Story />
      </div>
    ),
  ],
};
