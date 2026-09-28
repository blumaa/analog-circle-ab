import { useState, type FormEvent } from "react";
import { BottomSheet, Button, Input, RadioList, Textarea, useToast } from "@analog/ui";
import { useCreateCircle, useMe, useUpdateCircle } from "../../data/hooks";
import type { Circle, CircleType } from "../../data/types";
import { CIRCLE_TYPE_LABEL } from "../../lib/circles";
import styles from "./CircleFormSheet.module.css";

export interface CircleFormSheetProps {
  open: boolean;
  onClose: () => void;
  /** Edit this circle; omit to create. */
  circle?: Circle;
  /** Admins may create inner circles. */
  allowInner?: boolean;
  onSaved?: (circle: Circle) => void;
}

const typeOptions = (allowInner: boolean) =>
  (["inner", "interest", "location"] as CircleType[])
    .filter((t) => allowInner || t !== "inner")
    .map((value) => ({ value, label: CIRCLE_TYPE_LABEL[value] }));

/** Create or edit a circle. Mounts fresh each open so fields reset. */
export function CircleFormSheet(props: CircleFormSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} title={props.circle ? "Edit circle" : "New circle"}>
      {props.open && <CircleForm {...props} />}
    </BottomSheet>
  );
}

function CircleForm({ onClose, circle, allowInner = false, onSaved }: CircleFormSheetProps) {
  const { me } = useMe();
  const create = useCreateCircle();
  const update = useUpdateCircle();
  const toast = useToast();
  const [name, setName] = useState(circle?.name ?? "");
  const [description, setDescription] = useState(circle?.description ?? "");
  const [type, setType] = useState<CircleType>(circle?.type ?? "interest");
  const [number, setNumber] = useState(circle?.number?.toString() ?? "");

  const isInner = type === "inner";
  const valid = name.trim() !== "" && (!isInner || Number(number) > 0);
  const pending = create.isPending || update.isPending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !me) return;
    const fields = {
      name: name.trim(),
      description: description.trim(),
      type,
      number: isInner ? Number(number) : null,
    };
    try {
      const saved = circle
        ? await update.mutateAsync({ id: circle.id, patch: fields })
        : await create.mutateAsync({ ...fields, imageUrl: null, createdBy: me.id });
      toast.success(circle ? "Circle saved" : "Circle created");
      onClose();
      onSaved?.(saved);
    } catch {
      toast.error("Couldn't save the circle. Try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Textarea label="Description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      <RadioList label="Type" variant="chips" options={typeOptions(allowInner || isInner)} value={type} onChange={setType} />
      {isInner && (
        <Input
          label="Inner Circle number"
          type="number"
          inputMode="numeric"
          min={1}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
        />
      )}
      <Button type="submit" size="lg" fullWidth disabled={!valid || pending}>
        {circle ? "Save" : "Create circle"}
      </Button>
    </form>
  );
}
