import { Badge, LabeledField } from "@analog/ui";
import type { Member } from "../data";
import styles from "./ProfileSections.module.css";

export interface ProfileSectionsProps {
  member: Member;
}

/**
 * Read-only FROM / BIO / INTERESTS / FOOD fields for a member, shared by the
 * own-profile page and the per-member profile page. Edit affordances and
 * profile-specific links live in the consuming page, not here.
 */
export function ProfileSections({ member }: ProfileSectionsProps) {
  return (
    <>
      {member.from && <LabeledField label="From">{member.from}</LabeledField>}

      {member.bio && <LabeledField label="Bio">{member.bio}</LabeledField>}

      {member.interests.length > 0 && (
        <LabeledField label="Interests">
          <div className={styles.interests}>
            {member.interests.map((interest) => (
              <Badge key={interest} variant="neutral">
                {interest}
              </Badge>
            ))}
          </div>
        </LabeledField>
      )}

      {member.dietary && (
        <LabeledField label="Food Preferences">{member.dietary}</LabeledField>
      )}
    </>
  );
}
