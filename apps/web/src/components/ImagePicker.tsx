import { useId, type ChangeEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { IconButton, Spinner, useToast } from "@analog/ui";
import { useUploadImage } from "../data/hooks";
import styles from "./ImagePicker.module.css";

/** Keeps uploads small enough for the mock backend's localStorage. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export interface ImagePickerProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  /** wide = banner preview (post pictures); round = avatar preview (profile photos). */
  shape?: "wide" | "round";
}

/** Dashed "Upload" tile; shows a preview with a remove button once a picture is set. */
export function ImagePicker({ label, value, onChange, shape = "wide" }: ImagePickerProps) {
  const id = useId();
  const upload = useUploadImage();
  const toast = useToast();

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Pick a picture under 2 MB.");
      return;
    }
    upload.mutate(file, {
      onSuccess: onChange,
      onError: () => toast.error("Couldn't upload the picture. Try again."),
    });
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {value ? (
        <div className={styles.preview} data-shape={shape}>
          <img src={value} alt={`${label} preview`} className={styles.image} />
          <IconButton
            label="Remove picture"
            size={28}
            className={styles.remove}
            icon={<X size={14} />}
            onClick={() => onChange(null)}
          />
        </div>
      ) : (
        <div className={styles.tile}>
          <input id={id} type="file" accept="image/*" className={styles.input} onChange={pick} />
          {upload.isPending ? (
            <Spinner label="Uploading" />
          ) : (
            <>
              <ImagePlus size={18} strokeWidth={1.75} aria-hidden="true" />
              <span aria-hidden="true">Upload</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
