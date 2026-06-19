import { useState, type FormEvent } from "react";
import { Button, Input, LabeledField, SegmentedControl } from "@analog/ui";
import type { EventItem, Scope } from "../data";
import styles from "./EventForm.module.css";

export interface EventFormValues {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  address: string;
  scope: Scope;
}

export interface EventFormProps {
  initial?: Partial<EventItem>;
  groupId: string;
  onSubmit: (values: EventFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const empty: EventFormValues = {
  title: "",
  date: "",
  startTime: "16:00",
  endTime: "19:00",
  address: "",
  scope: "inner",
};

export function EventForm({ initial, onSubmit, onCancel, submitLabel = "Save event" }: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>({
    ...empty,
    ...(initial && {
      title: initial.title ?? "",
      date: initial.date ?? "",
      startTime: initial.startTime ?? "16:00",
      endTime: initial.endTime ?? "19:00",
      address: initial.address ?? "",
      scope: initial.scope ?? "inner",
    }),
  });

  const set = <K extends keyof EventFormValues>(key: K, v: EventFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.title.trim() || !values.date) return;
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Event details" className={styles.form}>
      <LabeledField label="Title">
        <Input
          aria-label="Title"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Inner Circle meeting"
        />
      </LabeledField>
      <LabeledField label="Date">
        <Input
          aria-label="Date"
          type="date"
          value={values.date}
          onChange={(e) => set("date", e.target.value)}
        />
      </LabeledField>
      <LabeledField label="Start">
        <Input
          aria-label="Start time"
          type="time"
          value={values.startTime}
          onChange={(e) => set("startTime", e.target.value)}
        />
      </LabeledField>
      <LabeledField label="End">
        <Input
          aria-label="End time"
          type="time"
          value={values.endTime}
          onChange={(e) => set("endTime", e.target.value)}
        />
      </LabeledField>
      <LabeledField label="Address">
        <Input
          aria-label="Address"
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          placeholder="Street, City"
        />
      </LabeledField>
      <SegmentedControl
        ariaLabel="Visibility"
        value={values.scope}
        onChange={(v) => set("scope", v as Scope)}
        options={[
          { value: "inner", label: "Inner Circle" },
          { value: "analog", label: "Analog Circle" },
        ]}
      />
      <div className={styles.actions}>
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
