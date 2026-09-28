import { useState, type FormEvent } from "react";
import { BottomSheet, Button, Input, Textarea, useToast } from "@analog/ui";
import { useUpdateMember } from "../../data/hooks";
import { ImagePicker } from "../../components/ImagePicker";
import type { Member } from "../../data/types";
import styles from "./ProfileFormSheet.module.css";

export interface ProfileFormSheetProps {
  open: boolean;
  onClose: () => void;
  member: Member;
}

type EditableField = "name" | "bio" | "phone" | "whatsappUrl" | "social" | "birthday";

const orNull = (value: string) => value.trim() || null;

/** Edit the signed-in member's own profile. Mounts fresh each open so fields reset. */
export function ProfileFormSheet(props: ProfileFormSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} title="Edit profile">
      {props.open && <ProfileForm {...props} />}
    </BottomSheet>
  );
}

function ProfileForm({ onClose, member }: ProfileFormSheetProps) {
  const update = useUpdateMember();
  const toast = useToast();
  const [fields, setFields] = useState<Record<EditableField, string>>({
    name: member.name,
    bio: member.bio ?? "",
    phone: member.phone ?? "",
    whatsappUrl: member.whatsappUrl ?? "",
    social: member.social ?? "",
    birthday: member.birthday ?? "",
  });
  const [photoUrl, setPhotoUrl] = useState(member.photoUrl);
  const set = (key: EditableField) => (e: { target: { value: string } }) =>
    setFields((curr) => ({ ...curr, [key]: e.target.value }));
  const valid = fields.name.trim() !== "";

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await update.mutateAsync({
        id: member.id,
        patch: {
          name: fields.name.trim(),
          photoUrl,
          bio: orNull(fields.bio),
          phone: orNull(fields.phone),
          whatsappUrl: orNull(fields.whatsappUrl),
          social: orNull(fields.social),
          birthday: orNull(fields.birthday),
        },
      });
      toast.success("Profile saved");
      onClose();
    } catch {
      toast.error("Couldn't save your profile. Try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <ImagePicker label="Profile photo" shape="round" value={photoUrl} onChange={setPhotoUrl} />
      <Input label="Name" value={fields.name} onChange={set("name")} required autoComplete="name" />
      <Textarea label="Bio" rows={3} value={fields.bio} onChange={set("bio")} />
      <Input label="Phone" type="tel" value={fields.phone} onChange={set("phone")} autoComplete="tel" />
      <Input label="WhatsApp link" type="url" value={fields.whatsappUrl} onChange={set("whatsappUrl")} placeholder="https://wa.me/49…" />
      <Input label="Social profile" type="url" value={fields.social} onChange={set("social")} placeholder="https://instagram.com/…" />
      <Input label="Birthday" type="date" value={fields.birthday} onChange={set("birthday")} />
      <Button type="submit" size="lg" fullWidth disabled={!valid || update.isPending}>
        Save
      </Button>
    </form>
  );
}
