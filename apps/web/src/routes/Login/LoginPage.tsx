import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Card, CardBody, Input } from "@analog/ui";
import { dataSource } from "../../data";
import { qk } from "../../data/hooks";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const finishSignIn = async () => {
    await qc.invalidateQueries({ queryKey: qk.currentMember });
    navigate("/innercircle/dashboard");
  };

  const handleEmail = async () => {
    if (!email.trim()) return;
    await dataSource.signInWithEmail(email.trim());
    // Mock signs in immediately; a real magic link would land on a callback route.
    setSent(true);
    await finishSignIn();
  };

  const devSignIn = async () => {
    await dataSource.devSignInAs("aaron");
    await finishSignIn();
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
              <Button type="submit" fullWidth>
                Email sign-in link
              </Button>
            </form>
            {sent && <p className={styles.note}>Signed in. Redirecting…</p>}

            <button type="button" className={styles.dev} onClick={devSignIn}>
              Dev sign-in (skip email)
            </button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
