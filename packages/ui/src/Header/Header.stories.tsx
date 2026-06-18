import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./Header";

const meta = {
  title: "Molecules/Header",
  component: Header,
  tags: ["autodocs"],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Community: Story = {
  args: {
    eyebrow: "Community",
    title: "The Loop",
    description: "Ask for help and offer what you can. Browse what's already here, then add your own need or offer.",
  },
};

export const Directory: Story = {
  args: {
    eyebrow: "Directory",
    title: "Everyone in the Circle",
    description: "Browse everyone in our community. Search by first name and reach out on WhatsApp.",
  },
};

export const TitleOnly: Story = { args: { title: "Your profile" } };
