import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CalendarClock, Heart, MessageCircle, Sparkles } from "lucide-react";
import { RadioList } from "./RadioList";

const sortOptions = [
  { value: "newest", label: "Newest", icon: <Sparkles size={17} /> },
  { value: "soonest", label: "Soonest", icon: <CalendarClock size={17} /> },
  { value: "reactions", label: "Most reactions", icon: <Heart size={17} /> },
  { value: "comments", label: "Most comments", icon: <MessageCircle size={17} /> },
];

const meta = {
  title: "Primitives/RadioList",
  component: RadioList,
  tags: ["autodocs"],
  args: { label: "Sort by", options: sortOptions, value: "newest", onChange: () => {} },
} satisfies Meta<typeof RadioList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  render: (args) => {
    const [value, setValue] = useState("newest");
    return <RadioList {...args} value={value} onChange={setValue} />;
  },
};

export const Chips: Story = {
  args: {
    label: "Type",
    variant: "chips",
    options: [
      { value: "event", label: "Event" },
      { value: "post", label: "Post" },
    ],
  },
  render: (args) => {
    const [value, setValue] = useState("event");
    return <RadioList {...args} value={value} onChange={setValue} />;
  },
};
