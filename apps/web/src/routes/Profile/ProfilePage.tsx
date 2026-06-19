import { useState } from "react";
import { Calendar, Compass, MessageCircle } from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Input,
  LabeledField,
  Textarea,
  useToast,
} from "@analog/ui";
import { useCurrentMemberId, useInnerGroup, useMember, useUpdateMember } from "../../data/hooks";
import { ProfileHeader } from "../../components/ProfileHeader";
import { ProfileSections } from "../../components/ProfileSections";
import { ProfileWall } from "../../components/ProfileWall";
import styles from "./ProfilePage.module.css";

interface EditFormState {
  from: string;
  bio: string;
  interests: string;
  dietary: string;
  photoUrl: string;
  whatsappUrl: string;
  homeAddress: string;
}

export function ProfilePage() {
  const { data: memberId = null } = useCurrentMemberId();
  const { data: member = null } = useMember(memberId ?? "");
  const { data: innerGroup = null } = useInnerGroup(memberId);
  const updateMember = useUpdateMember();

  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditFormState>({
    from: "",
    bio: "",
    interests: "",
    dietary: "",
    photoUrl: "",
    whatsappUrl: "",
    homeAddress: "",
  });

  if (!member) {
    return null;
  }

  function handleEditStart() {
    setForm({
      from: member!.from ?? "",
      bio: member!.bio ?? "",
      interests: member!.interests.join(", "),
      dietary: member!.dietary ?? "",
      photoUrl: member!.photoUrl ?? "",
      whatsappUrl: member!.whatsappUrl ?? "",
      homeAddress: member!.homeAddress ?? "",
    });
    setEditing(true);
  }

  function handleSave() {
    if (!memberId) return;
    updateMember.mutate(
      {
        id: memberId,
        patch: {
          from: form.from.trim() || null,
          bio: form.bio.trim() || null,
          interests: form.interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          dietary: form.dietary.trim() || null,
          photoUrl: form.photoUrl.trim() || null,
          whatsappUrl: form.whatsappUrl.trim() || null,
          homeAddress: form.homeAddress.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Profile updated.");
          setEditing(false);
        },
        onError: () => toast.error("Couldn't save your profile."),
      },
    );
  }

  function handleCancel() {
    setEditing(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.cardWrap}>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <ProfileHeader
              member={member}
              onEdit={editing ? undefined : handleEditStart}
            />
          </CardHeader>

          <CardBody>
            <div className={styles.sections}>
              {/* Inner Circle section */}
              <LabeledField label="Inner Circle">
                <div className={styles.innerCircleItems}>
                  {innerGroup && (
                    <a
                      href={`/innercircle/group/${innerGroup.id}`}
                      className={styles.groupLink}
                    >
                      <Compass size={14} aria-hidden="true" />
                      {innerGroup.name}
                    </a>
                  )}
                  <a
                    href="/innercircle/my-hosting-schedule"
                    className={styles.groupLink}
                  >
                    <Calendar size={14} aria-hidden="true" />
                    My hosting schedule
                  </a>
                  {member.whatsappUrl && (
                    <a
                      href={member.whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`${styles.groupLink} ${styles.groupLinkWhatsapp}`}
                    >
                      <MessageCircle size={14} aria-hidden="true" />
                      Access your private WhatsApp group
                    </a>
                  )}
                </div>
              </LabeledField>

              {/* Read-only profile fields or edit form */}
              {editing ? (
                <div className={styles.editForm}>
                  <Input
                    label="From"
                    value={form.from}
                    onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                    placeholder="City, Country"
                  />
                  <Input
                    label="Home Address"
                    value={form.homeAddress}
                    onChange={(e) => setForm((f) => ({ ...f, homeAddress: e.target.value }))}
                    placeholder="Street, Postcode City"
                  />
                  <Textarea
                    label="Bio"
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="A little about you…"
                    rows={4}
                  />
                  <Input
                    label="Interests"
                    value={form.interests}
                    onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
                    placeholder="hiking, cooking, music"
                  />
                  <Input
                    label="Food Preferences"
                    value={form.dietary}
                    onChange={(e) => setForm((f) => ({ ...f, dietary: e.target.value }))}
                    placeholder="Vegetarian, no nuts…"
                  />
                  <Input
                    label="Photo URL"
                    value={form.photoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, photoUrl: e.target.value }))}
                    placeholder="https://…"
                  />
                  <Input
                    label="WhatsApp URL"
                    value={form.whatsappUrl}
                    onChange={(e) => setForm((f) => ({ ...f, whatsappUrl: e.target.value }))}
                    placeholder="https://chat.whatsapp.com/…"
                  />
                  <div className={styles.editActions}>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={updateMember.isPending}
                    >
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <ProfileSections member={member} />
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <ProfileWall ownerId={member.id} />
    </div>
  );
}
