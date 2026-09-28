import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Cake, Pencil, Settings } from "lucide-react";
import { Avatar, Button, Chip, Eyebrow, IconLink, ListGroup, ListRow } from "@analog/ui";
import { useCircles, useMe, useMembers } from "../../data/hooks";
import { innerCircleLabel } from "../../lib/circles";
import { maskContact, memberContacts, type ContactKind } from "../../lib/contacts";
import { firstName, surnameInitial } from "../../lib/names";
import { formatBirthday, formatMonthYear } from "../../lib/dates";
import { CONTACT_ICON } from "../../features/members/ContactLinks";
import { InnerCircleBadge } from "../../features/members/InnerCircleBadge";
import { ProfileFormSheet } from "../../features/members/ProfileFormSheet";
import { EmptyState } from "../../components/EmptyState";
import styles from "./ProfilePage.module.css";

/** Own profile at /profile, any member at /members/:id. */
export function ProfilePage() {
  const { id } = useParams();
  const { me } = useMe();
  const { data: members } = useMembers();
  const { data: circles = [] } = useCircles();
  const [editing, setEditing] = useState(false);
  const [revealed, setRevealed] = useState<ContactKind[]>([]);

  const memberId = id ?? me?.id;
  const member = members?.find((m) => m.id === memberId);
  if (!members || !memberId) return null;
  if (!member) return <EmptyState>Member not found.</EmptyState>;

  const isOwn = member.id === me?.id;
  const initial = surnameInitial(member.name);
  const ic = innerCircleLabel(circles, member.id);
  const memberCircles = circles.filter((c) => c.memberIds.includes(member.id));

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <Avatar src={member.photoUrl} name={member.name} size={92} className={styles.avatar} />
        <h1 className={styles.name}>
          {firstName(member.name)}
          {initial && (
            <>
              {" "}
              <em className={styles.initial}>{initial}</em>
            </>
          )}
        </h1>
        <p className={styles.meta}>
          {ic && <InnerCircleBadge label={ic} />}
          <span>Member since {formatMonthYear(new Date(member.joinedAt))}</span>
        </p>
        {isOwn && (
          <div className={styles.actions}>
            <Button leftIcon={<Pencil size={16} />} onClick={() => setEditing(true)}>
              Edit profile
            </Button>
            <IconLink as={Link} to="/settings" label="Settings" icon={<Settings size={18} />} size={40} />
          </div>
        )}
      </header>

      {member.bio && (
        <section className={styles.card} aria-labelledby="profile-bio">
          <Eyebrow id="profile-bio">Bio</Eyebrow>
          <p className={styles.bio}>{member.bio}</p>
        </section>
      )}

      <ListGroup aria-label="Contact">
        {memberContacts(member).map((c) => {
          const row = { icon: CONTACT_ICON[c.kind](18), iconStyle: "plain", label: c.label } as const;
          const masked = maskContact(c);
          // Other members' numbers and emails stay masked until tapped; the first tap reveals, the next one contacts.
          return !isOwn && masked !== c.value && !revealed.includes(c.kind) ? (
            <ListRow key={c.kind} {...row} value={masked} chevron={false} onClick={() => setRevealed((curr) => [...curr, c.kind])} />
          ) : (
            <ListRow key={c.kind} {...row} value={c.value} href={c.href} external={c.href.startsWith("http")} />
          );
        })}
        {member.birthday && (
          <ListRow icon={<Cake size={18} />} iconStyle="plain" label="Birthday" value={formatBirthday(member.birthday)} />
        )}
      </ListGroup>

      {memberCircles.length > 0 && (
        <section className={styles.circles} aria-labelledby="profile-circles">
          <Eyebrow id="profile-circles">Circles</Eyebrow>
          <ul className={styles.chips} aria-label="Circles">
            {memberCircles.map((c) => (
              <li key={c.id}>
                <Chip static>{c.name}</Chip>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isOwn && <ProfileFormSheet open={editing} onClose={() => setEditing(false)} member={member} />}
    </div>
  );
}
