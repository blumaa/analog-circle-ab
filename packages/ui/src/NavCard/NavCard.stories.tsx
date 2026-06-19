import type { Meta, StoryObj } from "@storybook/react";
import { CalendarDays, Compass, HeartHandshake, User, Users } from "lucide-react";
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
        tone="accent"
      />
      <NavCard
        icon={<HeartHandshake />}
        title="The Loop"
        description="Ask for help and offer what you can"
        href="#"
        tone="rose"
      />
      <NavCard
        icon={<Compass />}
        title="Directory"
        description="Browse everyone in the community"
        href="#"
        tone="indigo"
      />
      <NavCard
        icon={<User />}
        title="Your profile"
        description="Bio, contact details, and group info"
        href="#"
        tone="green"
      />
    </div>
  ),
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", maxWidth: 640 }}>
      <NavCard icon={<Users />} title="Your Circle" description="accent (gold)" href="#" tone="accent" />
      <NavCard icon={<HeartHandshake />} title="The Loop" description="rose/pink" href="#" tone="rose" />
      <NavCard icon={<Compass />} title="Directory" description="indigo/blue" href="#" tone="indigo" />
      <NavCard icon={<User />} title="Your profile" description="green" href="#" tone="green" />
      <NavCard icon={<CalendarDays />} title="The Square" description="sky/blue" href="#" tone="sky" />
    </div>
  ),
};
