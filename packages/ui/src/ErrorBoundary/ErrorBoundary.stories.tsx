import type { Meta, StoryObj } from "@storybook/react";
import { ErrorBoundary } from "./ErrorBoundary";

function Boom(): never {
  throw new Error("This component failed to render.");
}

const meta = {
  title: "Utilities/ErrorBoundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  args: { children: <p>Everything is fine.</p> },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultFallback: Story = {
  render: () => (
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  ),
};

export const CustomFallback: Story = {
  render: () => (
    <ErrorBoundary fallback={(error, reset) => (
      <div style={{ padding: "1rem" }}>
        <p>Custom: {error.message}</p>
        <button type="button" onClick={reset}>reset</button>
      </div>
    )}>
      <Boom />
    </ErrorBoundary>
  ),
};

export const HealthyChildren: Story = {
  render: () => (
    <ErrorBoundary>
      <p>Everything is fine.</p>
    </ErrorBoundary>
  ),
};
