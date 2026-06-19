import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MentionTextarea } from "./MentionTextarea";
import type { Mentionable } from "./MentionTextarea";

const sampleMentionables: Mentionable[] = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "carol", name: "Carol" },
  { id: "david", name: "David" },
  { id: "eve", name: "Eve" },
];

const meta = {
  title: "Primitives/MentionTextarea",
  component: MentionTextarea,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, padding: 24 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MentionTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledStory(
  props: Partial<React.ComponentProps<typeof MentionTextarea>>,
) {
  const [value, setValue] = useState("");
  const [mentionIds, setMentionIds] = useState<string[]>([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <MentionTextarea
        value={value}
        onChange={setValue}
        mentionables={sampleMentionables}
        onMentionsChange={setMentionIds}
        placeholder="Write something… use @ to tag members"
        aria-label="Post body"
        {...props}
      />
      {mentionIds.length > 0 && (
        <p style={{ fontSize: 12, color: "#666", margin: 0 }}>
          Mentioned ids: {mentionIds.join(", ")}
        </p>
      )}
    </div>
  );
}

export const Default: Story = {
  args: {
    value: "",
    onChange: () => undefined,
    mentionables: sampleMentionables,
  },
  render: () => <ControlledStory />,
};

export const Disabled: Story = {
  args: {
    value: "This composer is read-only",
    onChange: () => undefined,
    mentionables: sampleMentionables,
    disabled: true,
  },
  render: (args) => (
    <MentionTextarea {...args} aria-label="Disabled composer" />
  ),
};
