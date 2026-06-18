import { useState } from "react";
import { Calendar, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, LabeledField, useToast } from "@analog/ui";
import { useCurrentMemberId, useInnerGroup, useMember, useUpdateMember } from "../../data/hooks";
import { dataSource } from "../../data";
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
}

export function ProfilePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
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

  async function handleSignOut() {
    await dataSource.signOut();
    await qc.invalidateQueries({ queryKey: ["currentMember"] });
    navigate("/innercircle/login");
  }

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <ProfileHeader member={member} />

        <div className={styles.sections}>
          <LabeledField label="Inner Circle">
            <div className={styles.innerCircleLinks}>
              {innerGroup && (
                <a
                  href={`/innercircle/group/${innerGroup.id}`}
                  className={styles.circleLink}
                >
                  <Compass size={15} aria-hidden="true" />
                  {innerGroup.name}
                </a>
              )}
              <a
                href="/innercircle/my-hosting-schedule"
                className={styles.circleLink}
              >
                <Calendar size={15} aria-hidden="true" />
                My hosting schedule
              </a>
              {member.whatsappUrl && (
                <a
                  href={member.whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.circleLink}
                >
                  Access your private WhatsApp group
                </a>
              )}
            </div>
          </LabeledField>

          {editing ? (
            <div className={styles.editForm}>
              <Input
                label="From"
                value={form.from}
                onChange={(e) => setForm((f) => ({ ...f, from: e.target.value }))}
                placeholder="City, Country"
              />
              <LabeledField label="Bio">
                <textarea
                  className={styles.bioTextarea}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="A little about you…"
                  rows={4}
                  aria-label="Bio"
                />
              </LabeledField>
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
                <Button variant="primary" onClick={handleSave} disabled={updateMember.isPending}>
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ProfileSections member={member} />
              <Button variant="outline" onClick={handleEditStart}>
                Edit profile
              </Button>
            </>
          )}
        </div>

        <Button variant="ghost" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </article>

      <ProfileWall ownerId={member.id} />
    </div>
  );
}
