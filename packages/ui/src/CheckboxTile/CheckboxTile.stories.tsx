import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CheckboxTile } from "./CheckboxTile";

const meta = {
  title: "Primitives/CheckboxTile",
  component: CheckboxTile,
  tags: ["autodocs"],
  args: { label: "My Circle", checked: true, onChange: () => {} },
} satisfies Meta<typeof CheckboxTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(args.checked);
    return <CheckboxTile {...args} checked={checked} onChange={setChecked} />;
  },
};
