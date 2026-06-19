import { useState } from "react";
import { Button, Input, MentionTextarea, SegmentedControl } from "@analog/ui";
import type { Member, Scope, WallPost } from "../data";
import styles from "./WallComposer.module.css";

export interface WallComposerProps {
  ownerId: string;
  authorId: string;
  canPostInner: boolean;
  /** Members list for the @mention picker. */
  members?: Member[];
  onPost: (input: Omit<WallPost, "id" | "createdAt">) => void;
}

const scopeOptions = [
  { value: "analog", label: "Public" },
  { value: "inner", label: "Inner circle only" },
];

export function WallComposer({
  ownerId,
  authorId,
  canPostInner,
  members = [],
  onPost,
}: WallComposerProps) {
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scope, setScope] = useState<Scope>("analog");
  const [mentions, setMentions] = useState<string[]>([]);

  // Exclude the author from the mentionable list.
  const mentionables = members
    .filter((m) => m.id !== authorId)
    .map((m) => ({ id: m.id, name: m.name }));

  function reset() {
    setBody("");
    setImageUrl("");
    setScope("analog");
    setMentions([]);
  }

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    onPost({
      ownerId,
      authorId,
      scope,
      body: trimmed,
      imageUrl: imageUrl.trim() || null,
      likedBy: [],
      replies: [],
      mentions,
    });
    reset();
  }

  return (
    <div className={styles.composer}>
      <MentionTextarea
        value={body}
        onChange={setBody}
        mentionables={mentionables}
        onMentionsChange={setMentions}
        placeholder="Write something… use @ to tag members"
        aria-label="Post body"
        rows={3}
      />
      <Input
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        aria-label="Image URL (optional)"
      />
      {canPostInner && (
        <SegmentedControl
          options={scopeOptions}
          value={scope}
          onChange={(v) => setScope(v as Scope)}
          ariaLabel="Post visibility"
        />
      )}
      <Button variant="primary" onClick={handleSubmit} disabled={!body.trim()}>
        Post
      </Button>
    </div>
  );
}
