import type { Circle, Member, Post } from "../data/types";

type Viewer = Pick<Member, "id" | "role"> | null | undefined;

export function isAdmin(viewer: Viewer): boolean {
  return viewer?.role === "admin";
}

function isAuthor(item: { authorId: string }, viewer: Viewer): boolean {
  return !!viewer && item.authorId === viewer.id;
}

/** Author only. Automated birthday posts have no editable fields. */
export function canEditPost(post: Pick<Post, "authorId" | "type">, viewer: Viewer): boolean {
  return post.type !== "birthday" && isAuthor(post, viewer);
}

export function canDeletePost(post: Pick<Post, "authorId">, viewer: Viewer): boolean {
  return isAuthor(post, viewer) || isAdmin(viewer);
}

export function canEditComment(comment: { authorId: string }, viewer: Viewer): boolean {
  return isAuthor(comment, viewer);
}

export function canDeleteComment(comment: { authorId: string }, viewer: Viewer): boolean {
  return isAuthor(comment, viewer) || isAdmin(viewer);
}

export function canEditCircle(circle: Pick<Circle, "createdBy">, viewer: Viewer): boolean {
  return (!!viewer && circle.createdBy === viewer.id) || isAdmin(viewer);
}
