import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, apiError } from "../lib/api";
import { Honeypot, Turnstile, turnstileEnabled } from "../components/BotGuard";
import styles from "../styles/Auth.module.css";

const Signup = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [load, setLoad] = useState(false);
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [attempt, setAttempt] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !username) return;

    setLoad(true);
    setError("");

    try {
      await api.post("/api/user/register", {
        email,
        password,
        userName: username,
        website,
        turnstileToken,
      });
      router.push("/Login");
    } catch (err) {
      setError(apiError(err, "Something went wrong. Please check your details and try again."));
      setTurnstileToken("");
      setAttempt((n) => n + 1);
    } finally {
      setLoad(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandName}>
            Ani<span className={styles.brandAccent}>World</span>
          </span>
        </div>

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Join the community</p>

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className={styles.input}
              placeholder="Choose a username"
              minLength={3}
              maxLength={30}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className={styles.input}
              placeholder="At least 8 characters"
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Honeypot value={website} onChange={setWebsite} />
          <Turnstile key={attempt} onToken={setTurnstileToken} />

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!email || !password || !username || load || (turnstileEnabled && !turnstileToken)}
          >
            {load ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/Login" className={styles.footerLink}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
