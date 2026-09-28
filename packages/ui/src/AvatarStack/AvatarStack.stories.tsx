import type { Meta, StoryObj } from "@storybook/react";
import { AvatarStack } from "./AvatarStack";

const people = ["Ada", "Cem", "Eli", "Bea", "Lu", "Mo", "Ny"].map((name) => ({ name }));

const meta = {
  title: "Primitives/AvatarStack",
  component: AvatarStack,
  tags: ["autodocs"],
  args: { people, label: "Going" },
} satisfies Meta<typeof AvatarStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Footer: Story = { args: { max: 5 } };
export const Detail: Story = { args: { size: 30, max: 4 } };
