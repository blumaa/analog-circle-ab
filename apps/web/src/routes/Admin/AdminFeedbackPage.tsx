import { Trash2 } from "lucide-react";
import { IconButton, useToast } from "@analog/ui";
import { useDeleteFeedback, useFeedback, useMembers } from "../../data/hooks";
import { AdminHeader } from "../../features/admin/AdminHeader";
import { EmptyState } from "../../components/EmptyState";
import { formatDay } from "../../lib/dates";
import styles from "./AdminFeedbackPage.module.css";

/** Notes members sent from the menu, newest first. */
export function AdminFeedbackPage() {
  const { data: feedback } = useFeedback();
  const { data: members = [] } = useMembers();
  const remove = useDeleteFeedback();
  const toast = useToast();
  const nameOf = new Map(members.map((m) => [m.id, m.name]));

  return (
    <div className={styles.page}>
      <AdminHeader title="Feedback" summary={feedback ? `${feedback.length} ${feedback.length === 1 ? "note" : "notes"}` : undefined} />
      {feedback &&
        (feedback.length > 0 ? (
          <div className={styles.scroll}>
            <table className={styles.table} aria-label="Feedback">
              <thead>
                <tr>
                  <th scope="col">From</th>
                  <th scope="col">Feedback</th>
                  <th scope="col">Date</th>
                  <th scope="col">
                    <span className={styles.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((f) => {
                  const name = nameOf.get(f.authorId) ?? "Former member";
                  return (
                    <tr key={f.id}>
                      <td className={styles.from}>{name}</td>
                      <td className={styles.body}>{f.body}</td>
                      <td className={styles.date}>
                        <time dateTime={f.createdAt}>{formatDay(new Date(f.createdAt))}</time>
                      </td>
                      <td>
                        <IconButton
                          label={`Delete feedback from ${name}`}
                          variant="danger"
                          size={30}
                          icon={<Trash2 size={14} />}
                          onClick={() =>
                            remove.mutate(f.id, { onSuccess: () => toast.success("Feedback deleted") })
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>No feedback yet.</EmptyState>
        ))}
    </div>
  );
}
