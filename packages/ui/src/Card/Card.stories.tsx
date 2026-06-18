import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";
import { Button } from "../Button/Button";

const meta = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  args: { children: "Card contents" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "active", "accent"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Active: Story = { args: { variant: "active", children: "Active card" } };
export const Accent: Story = { args: { variant: "accent", children: "Accent card" } };

export const Composed: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <strong>Inner Circle</strong>
        </CardHeader>
        <CardBody>
          A composed card using Header, Body, and Footer sections. Each section
          is self-styled with sensible padding and hairline dividers.
        </CardBody>
        <CardFooter>
          <Button size="sm" variant="outline">
            Action
          </Button>
        </CardFooter>
      </>
    ),
  },
};
