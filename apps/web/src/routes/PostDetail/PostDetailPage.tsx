import { Link, Navigate, useParams } from "react-router-dom";
import { Avatar, Eyebrow } from "@analog/ui";
import { useCircles, useMe, useMembers, usePosts } from "../../data/hooks";
import { EmptyState } from "../../components/EmptyState";
import { DetailTopBar } from "../../features/posts/DetailTopBar";
import { PostDiscussion } from "../../features/posts/PostDiscussion";
import { isVisible } from "../../lib/feed";
import { firstName } from "../../lib/names";
import { postTag } from "../../lib/postLabel";
import styles from "../../styles/detail.module.css";

/** A post or birthday post on its own page. Events have their own page. */
export function PostDetailPage() {
  const { id } = useParams();
  const { me } = useMe();
  const { data: posts } = usePosts();
  const { data: members = [] } = useMembers();
  const { data: circles } = useCircles();
  if (!me || !posts || !circles) return null;

  const post = posts.find((p) => p.id === id);
  if (!post || !isVisible(post, me.id, circles)) return <EmptyState>Post not found.</EmptyState>;
  if (post.type === "event") return <Navigate to={`/events/${post.id}`} replace />;

  const author = members.find((m) => m.id === post.authorId);

  return (
    <div className={styles.page}>
      <DetailTopBar post={post} me={me} />

      {post.imageUrl && <img src={post.imageUrl} alt="" className={styles.image} />}

      <header className={styles.header}>
        <Eyebrow as="p" tone="gold">
          {postTag(post, circles, me.id)}
        </Eyebrow>
        <h1 className={styles.title}>{post.title}</h1>
        {post.type !== "birthday" && (
          <p className={styles.byline}>
            <Avatar name={author?.name ?? "Former member"} src={author?.photoUrl} size={24} decorative />
            <span>
              by{" "}
              {author ? (
                <Link to={`/members/${author.id}`} className={styles.bylineName}>
                  {firstName(author.name)}
                </Link>
              ) : (
                "a former member"
              )}
            </span>
          </p>
        )}
      </header>

      {post.body && <p className={styles.body}>{post.body}</p>}

      <PostDiscussion post={post} me={me} />
    </div>
  );
}
