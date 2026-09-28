import type { Meta, StoryObj } from "@storybook/react";
import { House, Settings, User } from "lucide-react";
import { ListGroup, ListRow } from "./ListGroup";

const meta = {
  title: "Primitives/ListGroup",
  component: ListGroup,
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof ListGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Menu: Story = {
  render: () => (
    <ListGroup aria-label="Account">
      <ListRow icon={<User size={17} />} label="Profile" onClick={() => {}} />
      <ListRow icon={<Settings size={17} />} label="Settings" onClick={() => {}} />
      <ListRow icon={<House size={17} />} label="Home" onClick={() => {}} />
    </ListGroup>
  ),
};

export const DrillDown: Story = {
  render: () => (
    <ListGroup aria-label="Drill down">
      <ListRow label="Inactive" value={10} onClick={() => {}} />
      <ListRow label="Most active creators" value={12} highlighted onClick={() => {}} />
      <ListRow label="Most active members" value={20} onClick={() => {}} />
    </ListGroup>
  ),
};
