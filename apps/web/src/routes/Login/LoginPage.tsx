import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input, useToast } from "@analog/ui";
import logo from "../../assets/tac-logo.png";
import { dataSource } from "../../data";
import { CURRENT_MEMBER_ID } from "../../data/mock/fixtures";
import { qk } from "../../data/hooks";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const toast = useToast();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const enter = async () => {
    await qc.invalidateQueries({ queryKey: qk.currentMemberId });
    navigate(from, { replace: true });
  };

  const handleEmail = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    try {
      await dataSource.signInWithEmail(email.trim());
      // Mock signs in instantly; Firebase only sends a link (not signed in yet).
      if (await dataSource.getCurrentMemberId()) {
        await enter();
      } else {
        setStatus("sent");
        toast.success("Check your email for a one-time sign-in link.");
      }
    } catch (e) {
      setStatus("idle");
      toast.error(e instanceof Error ? e.message : "Couldn't send the sign-in link. Please try again.");
    }
  };

  const devSignIn = async () => {
    await dataSource.devSignInAs(CURRENT_MEMBER_ID);
    await enter();
  };

  return (
    <main className={styles.page}>
      <div className={styles.brand}>
        <img src={logo} alt="" className={styles.logo} />
        <p className={styles.wordmark}>The Analog Circle</p>
        <p className={styles.city}>Berlin</p>
      </div>
      <section className={styles.card} aria-labelledby="login-title">
        <h1 id="login-title" className={styles.title}>
          Sign in with email
        </h1>
        <p className={styles.lede}>
          Use the email you shared when you joined. We'll email you a one-time sign-in link, no password needed.
        </p>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void handleEmail();
          }}
        >
          <Input
            type="email"
            aria-label="Email address"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={status === "sending"}>
            {status === "sending" ? "Sending…" : "Email sign-in link"}
          </Button>
        </form>
        {status === "sent" && <p className={styles.lede}>Link sent. Open it on this device to sign in.</p>}
        {import.meta.env.DEV && (
          <Button variant="outline" size="sm" onClick={devSignIn}>
            Dev sign-in (skip email)
          </Button>
        )}
      </section>
    </main>
  );
}
