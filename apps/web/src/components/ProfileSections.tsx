import { Chip, LabeledField } from "@analog/ui";
import type { Member } from "../data";
import styles from "./ProfileSections.module.css";

export interface ProfileSectionsProps {
  member: Member;
}

/**
 * Read-only FROM / HOME ADDRESS / BIO / INTERESTS / FOOD fields for a member,
 * shared by the own-profile page and the per-member profile page.
 * Edit affordances live in the consuming page, not here.
 */
export function ProfileSections({ member }: ProfileSectionsProps) {
  return (
    <>
      {member.from && <LabeledField label="From">{member.from}</LabeledField>}

      {member.homeAddress && (
        <LabeledField label="Home Address">{member.homeAddress}</LabeledField>
      )}

      {member.bio && <LabeledField label="Bio">{member.bio}</LabeledField>}

      {member.interests.length > 0 && (
        <LabeledField label="Interests">
          <div className={styles.interests}>
            {member.interests.map((interest) => (
              <Chip key={interest} static className={styles.interestChip}>
                {interest}
              </Chip>
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
