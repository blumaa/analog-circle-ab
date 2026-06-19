import { useEffect, useId, useRef, useState } from "react";
import styles from "./MentionTextarea.module.css";

export interface Mentionable {
  id: string;
  name: string;
}

export interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  mentionables: Mentionable[];
  /** Emits the ids whose "@Name" currently appears in the text, whenever it changes. */
  onMentionsChange?: (ids: string[]) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

/** Extract the @-query fragment at or before the current cursor position. */
function getMentionQuery(text: string, cursorPos: number): string | null {
  const before = text.slice(0, cursorPos);
  const match = before.match(/@(\w*)$/);
  return match ? match[1]! : null;
}

/** Replace the active @fragment (before cursor) with "@DisplayName ". */
function insertMention(text: string, cursorPos: number, displayName: string): string {
  const before = text.slice(0, cursorPos);
  const after = text.slice(cursorPos);
  const replaced = before.replace(/@(\w*)$/, `@${displayName} `);
  return replaced + after;
}

/**
 * Recompute which selected ids still have their "@Name" present in the text.
 * Called whenever the text value changes so deletions remove stale ids.
 */
function reconcileMentions(
  text: string,
  selectedIds: Set<string>,
  mentionables: Mentionable[],
): string[] {
  return Array.from(selectedIds).filter((id) => {
    const m = mentionables.find((x) => x.id === id);
    return m ? text.includes(`@${m.name}`) : false;
  });
}

export function MentionTextarea({
  value,
  onChange,
  mentionables,
  onMentionsChange,
  placeholder,
  rows = 3,
  id: idProp,
  "aria-label": ariaLabel,
  disabled = false,
}: MentionTextareaProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listboxId = useId();
  const generatedId = useId();
  const textareaId = idProp ?? generatedId;

  const filteredOptions =
    mentionQuery !== null
      ? mentionables.filter((m) =>
          m.name.toLowerCase().includes(mentionQuery.toLowerCase()),
        )
      : [];

  const pickerOpen = !disabled && mentionQuery !== null && filteredOptions.length > 0;

  // Reset active index whenever the filtered list changes shape.
  useEffect(() => {
    setActiveIndex(0);
  }, [mentionQuery]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const { value: newValue, selectionStart } = e.target;
    const query = getMentionQuery(newValue, selectionStart ?? newValue.length);
    setMentionQuery(query);
    setActiveIndex(0);
    onChange(newValue);

    // Reconcile: drop ids whose "@Name" is no longer in the text.
    const active = reconcileMentions(newValue, selectedIds, mentionables);
    const activeSet = new Set(active);
    // Only update selectedIds state if something was actually removed.
    if (active.length !== selectedIds.size) {
      setSelectedIds(activeSet);
    }
    onMentionsChange?.(active);
  }

  function selectOption(option: Mentionable) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart ?? value.length;
    const newValue = insertMention(value, cursorPos, option.name);
    const newIds = new Set(selectedIds).add(option.id);
    setSelectedIds(newIds);
    setMentionQuery(null);
    onChange(newValue);
    onMentionsChange?.(Array.from(newIds).filter((id) => {
      const m = mentionables.find((x) => x.id === id);
      return m ? newValue.includes(`@${m.name}`) : false;
    }));
    // Restore focus and place cursor after the inserted name.
    setTimeout(() => {
      textarea.focus();
      const newCursor = newValue.indexOf(`@${option.name} `) + option.name.length + 2;
      textarea.setSelectionRange(newCursor, newCursor);
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!pickerOpen) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[activeIndex]) selectOption(filteredOptions[activeIndex]!);
        break;
      case "Escape":
        e.preventDefault();
        setMentionQuery(null);
        break;
    }
  }

  return (
    <div className={styles.wrapper}>
      <textarea
        ref={textareaRef}
        id={textareaId}
        className={styles.textarea}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={pickerOpen ? listboxId : undefined}
        aria-activedescendant={
          pickerOpen && filteredOptions[activeIndex]
            ? `${listboxId}-option-${activeIndex}`
            : undefined
        }
        disabled={disabled}
      />
      {pickerOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Tag a member"
          className={styles.mentionPicker}
        >
          {filteredOptions.map((option, i) => (
            <li
              key={option.id}
              id={`${listboxId}-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={styles.mentionOption}
              data-active={i === activeIndex || undefined}
              onMouseDown={(e) => {
                // Prevent textarea blur before we can record the selection.
                e.preventDefault();
                selectOption(option);
              }}
            >
              {option.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
