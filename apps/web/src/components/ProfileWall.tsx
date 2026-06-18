import { Badge, Button, Label, useToast } from "@analog/ui";
import { Trash2 } from "lucide-react";
import { useCurrentMemberId, useCreateWallPost, useDeleteWallPost, useInnerGroup, useMembers, useWallPosts } from "../data/hooks";
import { canDeleteWallPost } from "../lib/permissions";
import { WallComposer } from "./WallComposer";
import type { WallPost } from "../data";
import styles from "./ProfileWall.module.css";

export interface ProfileWallProps {
  ownerId: string;
}

export function ProfileWall({ ownerId }: ProfileWallProps) {
  const { data: currentMemberId = null } = useCurrentMemberId();
  const { data: posts = [] } = useWallPosts(ownerId);
  const { data: members = [] } = useMembers();
  const createPost = useCreateWallPost(ownerId);
  const deletePost = useDeleteWallPost(ownerId);
  const toast = useToast();
  const { data: viewerInnerGroup = null } = useInnerGroup(currentMemberId);
  const { data: ownerInnerGroup = null } = useInnerGroup(ownerId);

  const sharesInnerCircle =
    viewerInnerGroup !== null &&
    ownerInnerGroup !== null &&
    viewerInnerGroup.id === ownerInnerGroup.id;

  const canPostInner = currentMemberId === ownerId || sharesInnerCircle;
  const canSeeInner = canPostInner;

  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const visible = sorted.filter((p) => p.scope === "analog" || canSeeInner);

  function getAuthorName(authorId: string): string {
    return members.find((m) => m.id === authorId)?.name ?? authorId;
  }

  return (
    <section className={styles.wall}>
      <Label as="div">Wall</Label>

      {currentMemberId && (
        <WallComposer
          ownerId={ownerId}
          authorId={currentMemberId}
          canPostInner={canPostInner}
          onPost={(input) =>
            createPost.mutate(input, {
              onSuccess: () => toast.success("Posted to the wall."),
              onError: () => toast.error("Couldn't post to the wall."),
            })
          }
        />
      )}

      <ul className={styles.posts}>
        {visible.map((post) => (
          <WallPostItem
            key={post.id}
            post={post}
            authorName={getAuthorName(post.authorId)}
            currentMemberId={currentMemberId}
            onDelete={(id) =>
              deletePost.mutate(id, {
                onSuccess: () => toast.success("Post removed."),
                onError: () => toast.error("Couldn't remove the post."),
              })
            }
          />
        ))}
      </ul>
    </section>
  );
}

interface WallPostItemProps {
  post: WallPost;
  authorName: string;
  currentMemberId: string | null;
  onDelete: (id: string) => void;
}

function WallPostItem({ post, authorName, currentMemberId, onDelete }: WallPostItemProps) {
  const canDelete = canDeleteWallPost(post, currentMemberId);

  return (
    <li className={styles.post}>
      <div className={styles.postHeader}>
        <span className={styles.author}>{authorName}</span>
        <div className={styles.postMeta}>
          {post.scope === "inner" && <Badge variant="neutral">Inner</Badge>}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={() => onDelete(post.id)}
              aria-label="Delete post"
            >
              Delete
            </Button>
          )}
        </div>
      </div>
      <p className={styles.body}>{post.body}</p>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className={styles.image} />
      )}
    </li>
  );
}
