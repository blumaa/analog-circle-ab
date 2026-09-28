import { useId, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MapPin } from "lucide-react";
import {
  Button,
  CheckboxTile,
  Eyebrow,
  Input,
  ListGroup,
  ListRow,
  RadioList,
  SegmentedControl,
  Textarea,
  Toggle,
  useToast,
} from "@analog/ui";
import { useCircles, useCreatePost, useMe, usePosts, useUpdatePost } from "../../data/hooks";
import type { Circle, Member, Post, PostType, PublishTarget } from "../../data/types";
import { EmptyState } from "../../components/EmptyState";
import { useGoBack } from "../../components/useGoBack";
import { CirclePickerSheet } from "../../features/posts/CirclePickerSheet";
import { ImagePicker } from "../../components/ImagePicker";
import { canPublishTo, innerCircleOf, isPublicFeed } from "../../lib/circles";
import { canEditPost } from "../../lib/permissions";
import {
  emptyPostForm,
  postFormErrors,
  postFormFromPost,
  toPostInput,
  type PostFormErrors,
  type PostFormValues,
  type WhenMode,
} from "../../lib/postForm";
import styles from "./PostFormPage.module.css";

const TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: "event", label: "Event" },
  { value: "post", label: "Post" },
];

const WHEN_OPTIONS: { value: WhenMode; label: string }[] = [
  { value: "date", label: "I know the date" },
  { value: "group", label: "Let the group pick" },
];


export function NewPostPage() {
  const { me } = useMe();
  const { data: circles } = useCircles();
  const [params] = useSearchParams();
  if (!me || !circles) return null;

  const inner = innerCircleOf(circles, me.id);
  const fromCircle = params.get("circle");
  const publishedTo = fromCircle && canPublishTo(circles, me.id, fromCircle) ? [fromCircle] : [...(inner ? [inner.id] : []), "square"];
  return <PostForm me={me} circles={circles} initial={emptyPostForm(publishedTo)} />;
}

export function EditPostPage() {
  const { id } = useParams();
  const { me } = useMe();
  const { data: circles } = useCircles();
  const { data: posts } = usePosts();
  if (!me || !circles || !posts) return null;

  const post = posts.find((p) => p.id === id);
  if (!post) return <EmptyState>Post not found.</EmptyState>;
  if (!canEditPost(post, me)) return <EmptyState>You can only edit your own posts.</EmptyState>;
  return <PostForm me={me} circles={circles} post={post} initial={postFormFromPost(post)} />;
}

interface PostFormProps {
  me: Member;
  circles: Circle[];
  initial: PostFormValues;
  /** Set when editing; the type can't change then. */
  post?: Post;
}

function PostForm({ me, circles, initial, post }: PostFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { goBack } = useGoBack("/");
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const publishErrorId = useId();
  const guestLimitId = useId();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<PostFormErrors>({});
  const [pickingCircles, setPickingCircles] = useState(false);

  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const inner = innerCircleOf(circles, me.id);
  const isOther = (target: PublishTarget) => !isPublicFeed(target) && target !== inner?.id;
  const otherIds = values.publishedTo.filter(isOther);
  const pickable = circles.filter(
    (c) => c.id !== inner?.id && (c.memberIds.includes(me.id) || otherIds.includes(c.id)),
  );

  const toggleTarget = (target: PublishTarget, checked: boolean) =>
    setValues((v) => ({
      ...v,
      publishedTo: checked ? [...v.publishedTo, target] : v.publishedTo.filter((t) => t !== target),
    }));

  const otherLabel =
    otherIds.length === 0
      ? "Other circle"
      : otherIds.length === 1
        ? (circles.find((c) => c.id === otherIds[0])?.name ?? "1 circle")
        : `${otherIds.length} circles`;

  const isEvent = values.type === "event";
  const saving = createPost.isPending || updatePost.isPending;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = postFormErrors(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const input = toPostInput(values, me.id);
    const done = (saved: Post) => {
      toast.success(post ? "Saved." : "Created.");
      navigate(saved.type === "event" ? `/events/${saved.id}` : "/", { replace: true });
    };
    const failed = () => toast.error("Couldn't save. Try again.");
    if (post) updatePost.mutate({ id: post.id, patch: input }, { onSuccess: done, onError: failed });
    else createPost.mutate(input, { onSuccess: done, onError: failed });
  };

  const clear = () => {
    setValues(initial);
    setErrors({});
  };

  return (
    <form className={styles.page} onSubmit={submit} noValidate>
      <h1 className={styles.title}>{post ? "Edit post" : "New"}</h1>

      {post ? null : (
        <RadioList
          label="Type"
          variant="chips"
          options={TYPE_OPTIONS}
          value={values.type}
          onChange={(type) => set("type", type)}
        />
      )}

      <fieldset
        className={styles.fieldset}
        aria-invalid={errors.publishedTo ? true : undefined}
        aria-describedby={errors.publishedTo ? publishErrorId : undefined}
      >
        <Eyebrow as="legend" className={styles.legend}>
          Publish to
        </Eyebrow>
        <div className={styles.tiles}>
          <CheckboxTile
            label="The Loop"
            checked={values.publishedTo.includes("loop")}
            onChange={(checked) => toggleTarget("loop", checked)}
          />
          {inner ? (
            <CheckboxTile
              label="My Circle"
              checked={values.publishedTo.includes(inner.id)}
              onChange={(checked) => toggleTarget(inner.id, checked)}
            />
          ) : null}
          <CheckboxTile label={otherLabel} checked={otherIds.length > 0} onChange={() => setPickingCircles(true)} />
          <CheckboxTile
            label="The Square"
            checked={values.publishedTo.includes("square")}
            onChange={(checked) => toggleTarget("square", checked)}
          />
        </div>
        {errors.publishedTo ? (
          <p id={publishErrorId} className={styles.error}>
            {errors.publishedTo}
          </p>
        ) : null}
      </fieldset>

      <div className={styles.row}>
        <div className={styles.titleField}>
          <Input
            label="Title"
            placeholder="Give it a name"
            value={values.title}
            error={errors.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className={styles.picField}>
          <ImagePicker label="Display pic" value={values.imageUrl} onChange={(url) => set("imageUrl", url)} />
        </div>
      </div>

      <Textarea
        label="Description"
        placeholder="What's happening?"
        rows={5}
        value={values.body}
        onChange={(e) => set("body", e.target.value)}
      />

      {isEvent ? (
        <>
          <div className={styles.group}>
            <p className={styles.fieldLabel} aria-hidden="true">
              When
            </p>
            <SegmentedControl
              ariaLabel="When"
              variant="solid"
              options={WHEN_OPTIONS}
              value={values.when}
              onChange={(when) => set("when", when as WhenMode)}
            />
          </div>

          {values.when === "date" ? (
            <>
              <Input
                label="Date"
                type="date"
                value={values.date}
                error={errors.date}
                onChange={(e) => set("date", e.target.value)}
              />
              <div className={styles.row}>
                <div className={styles.half}>
                  <Input
                    label="Start time"
                    type="time"
                    value={values.startTime}
                    error={errors.startTime}
                    onChange={(e) => set("startTime", e.target.value)}
                  />
                </div>
                <div className={styles.half}>
                  <Input
                    label="Ends (optional)"
                    type="time"
                    value={values.endTime}
                    onChange={(e) => set("endTime", e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : null}

          <Input
            label="Where"
            placeholder="Address or venue"
            leftIcon={<MapPin size={18} />}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
          />

          <ListGroup aria-label="Options">
            <ListRow
              label={<span aria-hidden="true">Can bring a friend?</span>}
              trailing={
                <Toggle
                  label="Can bring a friend?"
                  checked={values.canBringFriend}
                  onChange={(checked) => set("canBringFriend", checked)}
                />
              }
            />
            <ListRow
              label={<span aria-hidden="true">Address visible?</span>}
              trailing={
                <Toggle
                  label="Address visible?"
                  checked={values.addressVisible}
                  onChange={(checked) => set("addressVisible", checked)}
                />
              }
            />
            <ListRow
              label={<label htmlFor={guestLimitId}>Guest limit?</label>}
              trailing={
                <div className={styles.guestLimit}>
                  <Input
                    id={guestLimitId}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    placeholder="None"
                    value={values.guestLimit}
                    error={errors.guestLimit}
                    onChange={(e) => set("guestLimit", e.target.value)}
                  />
                </div>
              }
            />
          </ListGroup>
        </>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" variant="primary" size="lg" className={styles.primary} disabled={saving}>
          {post ? "Save" : "Create"}
        </Button>
        <Button type="button" variant="secondary" size="lg" onClick={clear}>
          Clear
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={goBack}>
          Cancel
        </Button>
      </div>

      <CirclePickerSheet
        open={pickingCircles}
        onClose={() => setPickingCircles(false)}
        circles={pickable}
        selected={otherIds}
        onToggle={toggleTarget}
      />
    </form>
  );
}
