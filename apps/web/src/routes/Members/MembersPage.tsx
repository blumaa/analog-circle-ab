import { useState } from "react";
import { Search } from "lucide-react";
import { Badge, Header, Input } from "@analog/ui";
import { useMembers } from "../../data/hooks";
import { MemberCard } from "../../components/MemberCard";
import styles from "./MembersPage.module.css";

export function MembersPage() {
  const { data: members = [] } = useMembers();
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? members.filter((m) =>
        m.name.split(" ")[0]?.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : members;

  return (
    <div className={styles.page}>
      <Badge variant="neutral">{members.length} members</Badge>
      <Header
        eyebrow="Directory"
        title="Everyone in the Circle"
        description="Browse everyone in our community. Search by first name and reach out on WhatsApp."
      />
      <Input
        leftIcon={<Search size={16} />}
        placeholder="Search by first name…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search by first name…"
        className={styles.search}
      />
      <div className={styles.grid}>
        {filtered.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
