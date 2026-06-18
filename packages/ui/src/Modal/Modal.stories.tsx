import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "./Modal";
import { Button } from "../Button/Button";

const meta = {
  title: "Primitives/Modal",
  component: Modal,
  tags: ["autodocs"],
  args: {
    title: "Propose hosting swap",
    open: true,
    onClose: () => undefined,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    children: <p>Pick a meeting to swap with.</p>,
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button variant="primary">Send</Button>
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    children: <p>Pick a meeting to swap with.</p>,
  },
  render: (args) => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal
            {...args}
            open={open}
            onClose={() => setOpen(false)}
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setOpen(false)}>
                  Send
                </Button>
              </>
            }
          >
            <p>Pick a meeting to swap with.</p>
          </Modal>
        </>
      );
    }
    return <Demo />;
  },
};
