import { Bookmark, Share2 } from "lucide-react";
import { IconButton, useToast } from "@analog/ui";
import { usePrefList } from "../../data/hooks";
import type { Member, Post } from "../../data/types";
import { BackLink } from "../../components/BackLink";
import { shareLink } from "../../lib/share";
import { PostActions } from "./PostActions";
import styles from "./DetailTopBar.module.css";

export interface DetailTopBarProps {
  post: Post;
  me: Member;
}

/** Back, save, share and post options above an event or post detail page. */
export function DetailTopBar({ post, me }: DetailTopBarProps) {
  const favourites = usePrefList(me.id, "favouritePostIds");
  const toast = useToast();
  const saved = favourites.has(post.id);

  const share = async () => {
    try {
      const result = await shareLink({ title: post.title, url: window.location.href });
      if (result === "copied") toast.success("Link copied");
    } catch {
      toast.error("Couldn't share the link.");
    }
  };

  return (
    <div className={styles.topBar}>
      <BackLink fallback="/" />
      <div className={styles.actions}>
        <IconButton
          label={saved ? "Remove from favourites" : "Save to favourites"}
          variant={saved ? "tint" : "chip"}
          size={36}
          pressed={saved}
          icon={<Bookmark size={18} strokeWidth={1.75} fill={saved ? "currentColor" : "none"} />}
          onClick={() => favourites.toggle(post.id)}
        />
        <IconButton label="Share" size={36} icon={<Share2 size={18} strokeWidth={1.75} />} onClick={share} />
        <PostActions post={post} me={me} afterDelete="/" />
      </div>
    </div>
  );
}
