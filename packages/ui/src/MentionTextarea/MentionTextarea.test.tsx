import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { MentionTextarea } from "./MentionTextarea";
import type { Mentionable } from "./MentionTextarea";

const mentionables: Mentionable[] = [
  { id: "alice", name: "Alice" },
  { id: "bob", name: "Bob" },
  { id: "carol", name: "Carol" },
];

interface WrapperProps {
  initialValue?: string;
  onMentionsChange?: (ids: string[]) => void;
  disabled?: boolean;
}

/**
 * Controlled wrapper — threads value/onChange through local state so tests
 * interact with MentionTextarea exactly as a real parent component would.
 */
function ControlledWrapper({ initialValue = "", onMentionsChange, disabled }: WrapperProps) {
  const [value, setValue] = useState(initialValue);
  return (
    <MentionTextarea
      value={value}
      onChange={setValue}
      mentionables={mentionables}
      onMentionsChange={onMentionsChange}
      aria-label="Post body"
      disabled={disabled}
    />
  );
}

describe("MentionTextarea", () => {
  describe("picker open/close", () => {
    it("shows the listbox when '@' is typed", async () => {
      render(<ControlledWrapper />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      expect(screen.getByRole("listbox", { name: /tag a member/i })).toBeInTheDocument();
    });

    it("shows all mentionables when no filter fragment follows '@'", async () => {
      render(<ControlledWrapper />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      expect(screen.getByRole("option", { name: "Alice" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Bob" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Carol" })).toBeInTheDocument();
    });

    it("filters options case-insensitively by the fragment after '@'", async () => {
      render(<ControlledWrapper />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@al");
      expect(screen.getByRole("option", { name: "Alice" })).toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Bob" })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: "Carol" })).not.toBeInTheDocument();
    });

    it("closes the listbox when Escape is pressed", async () => {
      render(<ControlledWrapper />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("does not open the listbox when disabled", async () => {
      render(<ControlledWrapper disabled />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      expect(textarea).toBeDisabled();
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  describe("keyboard selection", () => {
    it("selects the first option via Enter, closes the picker, and inserts '@Name'", async () => {
      render(<ControlledWrapper />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "@");
      await userEvent.keyboard("{Enter}");
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      expect((textarea as HTMLTextAreaElement).value).toContain("@Alice");
    });

    it("fires onMentionsChange with the selected id after Enter", async () => {
      const onMentionsChange = vi.fn();
      render(<ControlledWrapper onMentionsChange={onMentionsChange} />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      await userEvent.keyboard("{Enter}");
      expect(onMentionsChange).toHaveBeenCalledWith(expect.arrayContaining(["alice"]));
    });

    it("moves active option with ArrowDown", async () => {
      render(<ControlledWrapper />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      await userEvent.keyboard("{ArrowDown}");
      expect(screen.getByRole("option", { name: "Bob" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("selects the ArrowDown-activated option on Enter", async () => {
      const onMentionsChange = vi.fn();
      render(<ControlledWrapper onMentionsChange={onMentionsChange} />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      await userEvent.keyboard("{ArrowDown}{Enter}");
      expect(onMentionsChange).toHaveBeenCalledWith(expect.arrayContaining(["bob"]));
    });
  });

  describe("mouse selection", () => {
    it("selects via mouse click and fires onMentionsChange with the id", async () => {
      const onMentionsChange = vi.fn();
      render(<ControlledWrapper onMentionsChange={onMentionsChange} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });
      await userEvent.type(textarea, "Hey @");
      await userEvent.click(screen.getByRole("option", { name: "Carol" }));
      expect(onMentionsChange).toHaveBeenCalledWith(expect.arrayContaining(["carol"]));
      expect((textarea as HTMLTextAreaElement).value).toContain("@Carol");
    });
  });

  describe("mention reconciliation", () => {
    it("drops the id from onMentionsChange when '@Name' is deleted from the text", async () => {
      const onMentionsChange = vi.fn();
      render(<ControlledWrapper onMentionsChange={onMentionsChange} />);
      const textarea = screen.getByRole("textbox", { name: /post body/i });

      // Select Alice via Enter.
      await userEvent.type(textarea, "@");
      await userEvent.keyboard("{Enter}");
      const callsAfterSelect = onMentionsChange.mock.calls;
      const lastCallAfterSelect = callsAfterSelect[callsAfterSelect.length - 1]!;
      expect(lastCallAfterSelect[0]).toContain("alice");

      // Clear the textarea — Alice mention disappears.
      await userEvent.tripleClick(textarea);
      await userEvent.keyboard("{Backspace}");
      const allCalls = onMentionsChange.mock.calls;
      const lastCall = allCalls[allCalls.length - 1]!;
      expect(lastCall[0]).toEqual([]);
    });
  });

  describe("accessibility", () => {
    it("has no violations when the picker is closed", async () => {
      const { container } = render(<ControlledWrapper />);
      expect(await axe(container)).toHaveNoViolations();
    });

    it("has no violations when the picker is open", async () => {
      const { container } = render(<ControlledWrapper />);
      await userEvent.type(screen.getByRole("textbox", { name: /post body/i }), "@");
      expect(await axe(container)).toHaveNoViolations();
    });

    it("sets aria-autocomplete='list' on the textarea", () => {
      render(<ControlledWrapper />);
      expect(screen.getByRole("textbox", { name: /post body/i })).toHaveAttribute(
        "aria-autocomplete",
        "list",
      );
    });
  });
});
