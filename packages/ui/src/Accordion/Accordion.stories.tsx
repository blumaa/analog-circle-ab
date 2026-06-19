import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";
import { Badge } from "../Badge/Badge";

const meta = {
  title: "Primitives/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  args: {
    summary: "Attendance — 5 of 7 going",
    children: "Ada, Babbage, Curie, Dijkstra, Euler are going.",
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const WithTrailing: Story = {
  args: {
    summary: "RSVP",
    trailing: <Badge variant="success">You&apos;re going</Badge>,
    children: "Update your RSVP any time before the event.",
  },
};

export const DividedOpen: Story = {
  args: {
    summary: "Inner Circle meeting — June 2026",
    trailing: <Badge variant="accent">You&apos;re hosting</Badge>,
    defaultOpen: true,
    divided: true,
    children: "Full-width hairline appears between the trigger and this content.",
  },
};

export const LongSummaryWithTrailing: Story = {
  args: {
    summary:
      "Inner Circle meeting — a long title that should wrap naturally rather than being crushed into three cramped lines",
    trailing: <Badge variant="accent">You&apos;re hosting</Badge>,
    children: "The summary stays readable; the trailing badge wraps below on narrow widths.",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};
