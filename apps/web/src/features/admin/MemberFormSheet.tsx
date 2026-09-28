import { useState, type FormEvent } from "react";
import { BottomSheet, Button, Input, RadioList, useToast } from "@analog/ui";
import { useCreateMember, useSetCircleMembership, useUpdateMember } from "../../data/hooks";
import type { Circle, Member, Role } from "../../data/types";
import { innerCircleOf } from "../../lib/circles";
import styles from "./MemberFormSheet.module.css";

export interface MemberFormSheetProps {
  open: boolean;
  onClose: () => void;
  circles: Circle[];
  /** Edit this member; omit to create. */
  member?: Member;
}

const NONE = "none";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "member", label: "Member" },
  { value: "admin", label: "Admin" },
];

/** Admin create/edit for a member, including their Inner Circle. Mounts fresh each open so fields reset. */
export function MemberFormSheet(props: MemberFormSheetProps) {
  return (
    <BottomSheet open={props.open} onClose={props.onClose} title={props.member ? "Edit member" : "New member"}>
      {props.open && <MemberForm {...props} />}
    </BottomSheet>
  );
}

function MemberForm({ onClose, circles, member }: MemberFormSheetProps) {
  const create = useCreateMember();
  const update = useUpdateMember();
  const setMembership = useSetCircleMembership();
  const toast = useToast();
  const currentInner = member ? (innerCircleOf(circles, member.id)?.id ?? NONE) : NONE;
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [role, setRole] = useState<Role>(member?.role ?? "member");
  const [inner, setInner] = useState(currentInner);

  const innerOptions = [
    { value: NONE, label: "None" },
    ...circles
      .filter((c) => c.type === "inner")
      .toSorted((a, b) => (a.number ?? 0) - (b.number ?? 0))
      .map((c) => ({ value: c.id, label: `IC${c.number}` })),
  ];
  const valid = name.trim() !== "" && email.trim() !== "";
  const pending = create.isPending || update.isPending || setMembership.isPending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const fields = { name: name.trim(), email: email.trim(), role };
    try {
      const saved = member
        ? await update.mutateAsync({ id: member.id, patch: fields })
        : await create.mutateAsync({ ...fields, photoUrl: null, bio: null, phone: null, whatsappUrl: null, social: null, birthday: null });
      // Joining an inner circle leaves the old one; "None" leaves the current one.
      if (inner !== currentInner) {
        const [circleId, joins] = inner === NONE ? [currentInner, false] : [inner, true];
        await setMembership.mutateAsync({ circleId, memberId: saved.id, member: joins });
      }
      toast.success(member ? "Member saved" : "Member added");
      onClose();
    } catch {
      toast.error("Couldn't save the member. Try again.");
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <RadioList label="Role" variant="chips" options={ROLE_OPTIONS} value={role} onChange={setRole} />
      <RadioList label="Inner Circle" variant="chips" options={innerOptions} value={inner} onChange={setInner} />
      <Button type="submit" size="lg" fullWidth disabled={!valid || pending}>
        {member ? "Save" : "Add member"}
      </Button>
    </form>
  );
}
