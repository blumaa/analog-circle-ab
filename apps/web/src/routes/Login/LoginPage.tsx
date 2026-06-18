import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Input, useToast } from "@analog/ui";
import { dataSource } from "../../data";
import { qk } from "../../data/hooks";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();

  const goToDashboard = async () => {
    await qc.invalidateQueries({ queryKey: qk.currentMember });
    navigate("/innercircle/dashboard");
  };

  const handleEmail = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    try {
      await dataSource.signInWithEmail(email.trim());
      // Mock signs in instantly; Firebase only sends a link (not signed in yet).
      const memberId = await dataSource.getCurrentMemberId();
      if (memberId) {
        await goToDashboard();
      } else {
        setStatus("sent");
        toast.success("Check your email for a one-time sign-in link.");
      }
    } catch (e) {
      setStatus("idle");
      toast.error(
        e instanceof Error ? e.message : "Couldn't send the sign-in link. Please try again.",
      );
    }
  };

  const devSignIn = async () => {
    await dataSource.devSignInAs("aaron");
    await goToDashboard();
  };

  return (
    <div className={styles.shell}>
      <header className={styles.head}>
        <span className={styles.brand}>Inner Circle</span>
        <span className={styles.sub}>Member sign-in</span>
      </header>

      <div className={styles.center}>
        <Card className={styles.card}>
          <CardBody className={styles.cardBody}>
            <h1 className={styles.title}>Sign in with email</h1>
            <p className={styles.lede}>
              Use the email you shared when you joined. We'll email you a one-time sign-in link, no
              password needed.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleEmail();
              }}
              className={styles.form}
            >
              <Input
                type="email"
                aria-label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" fullWidth disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Email sign-in link"}
              </Button>
            </form>
            {import.meta.env.DEV && (
              <Button
                variant="ghost"
                size="sm"
                className={styles.dev}
                onClick={devSignIn}
              >
                Dev sign-in (skip email)
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
