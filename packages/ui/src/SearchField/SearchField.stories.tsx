import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchField } from "./SearchField";

const meta = {
  title: "Primitives/SearchField",
  component: SearchField,
  tags: ["autodocs"],
  args: { value: "", onChange: () => {} },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return <SearchField {...args} value={value} onChange={setValue} />;
  },
};
