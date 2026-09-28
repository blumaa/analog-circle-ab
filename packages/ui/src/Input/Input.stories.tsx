import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, MapPin } from "lucide-react";
import { Input } from "./Input";

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  args: { label: "Title", placeholder: "Give it a name" },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LeftIcon: Story = { args: { label: "Where", placeholder: "Address or venue", leftIcon: <MapPin size={16} /> } };
export const RightIcon: Story = { args: { label: "Date", placeholder: "DD/MM/YYYY", rightIcon: <Calendar size={16} /> } };
