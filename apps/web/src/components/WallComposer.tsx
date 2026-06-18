import { useState } from "react";
import { Button, Input, SegmentedControl } from "@analog/ui";
import type { Scope, WallPost } from "../data";
import styles from "./WallComposer.module.css";

export interface WallComposerProps {
  ownerId: string;
  authorId: string;
  canPostInner: boolean;
  onPost: (input: Omit<WallPost, "id" | "createdAt">) => void;
}

const scopeOptions = [
  { value: "analog", label: "Public" },
  { value: "inner", label: "Inner circle only" },
];

export function WallComposer({ ownerId, authorId, canPostInner, onPost }: WallComposerProps) {
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scope, setScope] = useState<Scope>("analog");

  function handleSubmit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    onPost({
      ownerId,
      authorId,
      scope,
      body: trimmed,
      imageUrl: imageUrl.trim() || null,
    });
    setBody("");
    setImageUrl("");
    setScope("analog");
  }

  return (
    <div className={styles.composer}>
      <textarea
        className={styles.textarea}
        placeholder="Write something…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        aria-label="Post body"
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
