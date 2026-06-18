import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./ToastProvider";
import { Button } from "../Button/Button";

const meta = {
  title: "Primitives/Toast",
  component: Toast,
  tags: ["autodocs"],
  args: {
    onDismiss: () => undefined,
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: { variant: "success", message: "Saved successfully." },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 360 }}>
      <Toast variant="success" message="Check your email for a sign-in link." onDismiss={() => undefined} />
      <Toast variant="error" message="Something went wrong. Please try again." onDismiss={() => undefined} />
      <Toast variant="info" message="Your session expires in 5 minutes." onDismiss={() => undefined} />
    </div>
  ),
};

function PushDemo() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button variant="success" onClick={() => toast.success("Success toast!")}>
        Success
      </Button>
      <Button variant="danger" onClick={() => toast.error("Error toast!")}>
        Error
      </Button>
      <Button variant="ghost" onClick={() => toast.info("Info toast!")}>
        Info
      </Button>
    </div>
  );
}

export const WithProvider: Story = {
  args: { variant: "info", message: "Trigger a toast from the buttons." },
  render: () => (
    <ToastProvider>
      <PushDemo />
    </ToastProvider>
  ),
};
