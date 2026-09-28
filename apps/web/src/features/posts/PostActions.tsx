import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ellipsis, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { BottomSheet, IconButton, ListGroup, ListRow, useToast } from "@analog/ui";
import { useDeletePost, useSetPostPinned } from "../../data/hooks";
import type { Member, Post } from "../../data/types";
import { ConfirmSheet } from "../../components/ConfirmSheet";
import { canDeletePost, canEditPost, isAdmin } from "../../lib/permissions";

export interface PostActionsProps {
  post: Post;
  me: Member;
  /** Where to go after deleting, e.g. back to the feed from a detail page. */
  afterDelete?: string;
}

/** ⋯ button with Edit and Delete for authors; Pin and Delete for admins. Renders nothing otherwise. */
export function PostActions({ post, me, afterDelete }: PostActionsProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const remove = useDeletePost();
  const pin = useSetPostPinned();
  const [sheet, setSheet] = useState<"menu" | "confirm" | null>(null);
  const canEdit = canEditPost(post, me);
  const canDelete = canDeletePost(post, me);
  const canPin = isAdmin(me);
  if (!canEdit && !canDelete) return null;

  const togglePin = () => {
    setSheet(null);
    pin.mutate(
      { id: post.id, pinned: !post.pinned },
      { onSuccess: () => toast.success(post.pinned ? "Post unpinned" : "Post pinned") },
    );
  };

  const confirmDelete = () => {
    setSheet(null);
    remove.mutate(post.id, {
      onSuccess: () => {
        toast.success("Post deleted");
        if (afterDelete) navigate(afterDelete);
      },
    });
  };

  return (
    <>
      <IconButton
        label="Post options"
        variant="ghost"
        size={28}
        shape="square"
        icon={<Ellipsis size={16} strokeWidth={1.75} />}
        onClick={() => setSheet("menu")}
      />
      <BottomSheet open={sheet === "menu"} onClose={() => setSheet(null)} title="Post options">
        <ListGroup aria-label="Post options">
          {canEdit && (
            <ListRow label="Edit post" icon={<Pencil size={16} />} onClick={() => navigate(`/posts/${post.id}/edit`)} />
          )}
          {canPin && (
            <ListRow
              label={post.pinned ? "Unpin post" : "Pin post"}
              icon={post.pinned ? <PinOff size={16} /> : <Pin size={16} />}
              onClick={togglePin}
            />
          )}
          {canDelete && <ListRow label="Delete post" icon={<Trash2 size={16} />} onClick={() => setSheet("confirm")} />}
        </ListGroup>
      </BottomSheet>
      <ConfirmSheet
        open={sheet === "confirm"}
        title="Delete post?"
        confirmLabel="Delete post"
        onClose={() => setSheet(null)}
        onConfirm={confirmDelete}
      >
        Its comments and RSVPs go with it. This can't be undone.
      </ConfirmSheet>
    </>
  );
}
