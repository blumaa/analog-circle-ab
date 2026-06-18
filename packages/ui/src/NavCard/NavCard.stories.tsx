import type { Meta, StoryObj } from "@storybook/react";
import { Compass, HeartHandshake, User, Users } from "lucide-react";
import { NavCard } from "./NavCard";

const meta = {
  title: "Molecules/NavCard",
  component: NavCard,
  tags: ["autodocs"],
  args: {
    icon: <Users />,
    title: "Your Circle",
    description: "Meetings, 1-1s, members, map, and food preferences",
    href: "#",
  },
} satisfies Meta<typeof NavCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutDescription: Story = {
  args: { description: undefined },
};

export const List: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 480 }}>
      <NavCard
        icon={<Users />}
        title="Your Circle"
        description="Meetings, 1-1s, members, map, and food preferences"
        href="#"
      />
      <NavCard
        icon={<HeartHandshake />}
        title="The Loop"
        description="Ask for help and offer what you can"
        href="#"
      />
      <NavCard
        icon={<Compass />}
        title="Directory"
        description="Browse everyone in the community"
        href="#"
      />
      <NavCard
        icon={<User />}
        title="Your profile"
        description="Bio, contact details, and group info"
        href="#"
      />
    </div>
  ),
};
