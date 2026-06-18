import { useParams } from "react-router-dom";
import { Badge } from "@analog/ui";
import { useInnerGroup, useMember } from "../../data/hooks";
import { ProfileHeader } from "../../components/ProfileHeader";
import { ProfileSections } from "../../components/ProfileSections";
import { ProfileWall } from "../../components/ProfileWall";
import styles from "./MemberProfilePage.module.css";

export function MemberProfilePage() {
  const { id = "" } = useParams();
  const { data: member = null, isLoading } = useMember(id);
  const { data: innerGroup = null } = useInnerGroup(id);

  if (!member) {
    if (isLoading) return null;
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>Member not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <ProfileHeader member={member} />

        {innerGroup && (
          <div className={styles.chips}>
            <Badge variant="accent">{innerGroup.name}</Badge>
          </div>
        )}

        <div className={styles.sections}>
          <ProfileSections member={member} />
        </div>
      </article>

      <ProfileWall ownerId={member.id} />
    </div>
  );
}
