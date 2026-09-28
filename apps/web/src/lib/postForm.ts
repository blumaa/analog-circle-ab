import type { Post, PostInput, PostType, PublishTarget } from "../data/types";

/** Whether the author sets the date or leaves it to the group. */
export type WhenMode = "date" | "group";

/** Form state for the New / Edit post screen. Inputs hold strings; toPostInput converts. */
export interface PostFormValues {
  type: PostType;
  title: string;
  body: string;
  imageUrl: string | null;
  publishedTo: PublishTarget[];
  when: WhenMode;
  date: string;
  startTime: string;
  endTime: string;
  address: string;
  canBringFriend: boolean;
  addressVisible: boolean;
  guestLimit: string;
}

export type PostFormErrors = Partial<Record<"title" | "publishedTo" | "date" | "startTime" | "guestLimit", string>>;

export function emptyPostForm(publishedTo: PublishTarget[]): PostFormValues {
  return {
    type: "event",
    title: "",
    body: "",
    imageUrl: null,
    publishedTo,
    when: "date",
    date: "",
    startTime: "",
    endTime: "",
    address: "",
    canBringFriend: true,
    addressVisible: false,
    guestLimit: "",
  };
}

export function postFormFromPost(post: Post): PostFormValues {
  const event = post.event;
  return {
    type: post.type,
    title: post.title,
    body: post.body,
    imageUrl: post.imageUrl,
    publishedTo: post.publishedTo,
    when: event && !event.date ? "group" : "date",
    date: event?.date ?? "",
    startTime: event?.startTime ?? "",
    endTime: event?.endTime ?? "",
    address: event?.address ?? "",
    canBringFriend: event?.canBringFriend ?? true,
    addressVisible: event?.addressVisible ?? false,
    guestLimit: event?.guestLimit?.toString() ?? "",
  };
}

const isEvent = (v: PostFormValues) => v.type === "event";
const knowsDate = (v: PostFormValues) => isEvent(v) && v.when === "date";

export function postFormErrors(v: PostFormValues): PostFormErrors {
  const errors: PostFormErrors = {};
  if (!v.title.trim()) errors.title = "Give it a name.";
  if (v.publishedTo.length === 0) errors.publishedTo = "Pick at least one place to publish.";
  if (knowsDate(v) && !v.date) errors.date = "Pick a date.";
  if (knowsDate(v) && !v.startTime) errors.startTime = "Pick a start time.";
  if (isEvent(v) && v.guestLimit !== "" && !(Number(v.guestLimit) >= 1)) {
    errors.guestLimit = "Use a number above zero, or leave it empty.";
  }
  return errors;
}

const orNull = (s: string) => s.trim() || null;

export function toPostInput(v: PostFormValues, authorId: string): PostInput {
  const dated = knowsDate(v);
  return {
    type: v.type,
    title: v.title.trim(),
    body: v.body.trim(),
    imageUrl: v.imageUrl,
    authorId,
    publishedTo: v.publishedTo,
    event: isEvent(v)
      ? {
          date: dated ? v.date : null,
          startTime: dated ? orNull(v.startTime) : null,
          endTime: dated ? orNull(v.endTime) : null,
          address: orNull(v.address),
          addressVisible: v.addressVisible,
          canBringFriend: v.canBringFriend,
          guestLimit: v.guestLimit === "" ? null : Number(v.guestLimit),
        }
      : null,
  };
}
