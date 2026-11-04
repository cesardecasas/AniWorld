import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { api, apiError } from "../lib/api";
import { Turnstile, turnstileEnabled } from "../components/BotGuard";
import { Loader } from "../components/ResponseHandlers";
import type { User } from "../types";
import styles from "../styles/Auth.module.css";

interface LoginProps {
  setAuthenticated: (value: boolean) => void;
  setCurrentUser: (user: User | null) => void;
}

const Login = ({ setAuthenticated, setCurrentUser }: LoginProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [load, setLoad] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [attempt, setAttempt] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoad(true);
    setError("");

    try {
      const login = await api.post("/auth/login", { email, password, turnstileToken });
      // The session cookie is set by the server; the response only carries the public user
      if (login.data?.user) {
        setCurrentUser({
          userName: login.data.user.userName,
          id: login.data.user.id,
        });
        setAuthenticated(true);
        router.push("/");
        return;
      }
      setError("Invalid email or password. Please try again.");
    } catch (err) {
      setError(apiError(err, "Invalid email or password. Please try again."));
      // Turnstile tokens are single-use, so get a fresh challenge for the retry
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

        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Sign in to your account</p>

        {error && (
          <div className={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Turnstile key={attempt} onToken={setTurnstileToken} />

          {load ? (
            <div className={styles.loaderWrap}>
              <Loader />
            </div>
          ) : (
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!email || !password || (turnstileEnabled && !turnstileToken)}
            >
              Sign in
            </button>
          )}
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={styles.footerLink}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
