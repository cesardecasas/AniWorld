import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
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
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(false);

  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoad(true);
    setError(false);

    try {
      const login = await client.post("/api/user/login", { email, password });
      if (login.data?.token) {
        localStorage.setItem("token", login.data.token);
        setCurrentUser({
          userName: login.data.user.userName,
          id: login.data.user.id,
        });
        setAuthenticated(true);
        router.push("/");
        return;
      }
      setError(true);
    } catch (err) {
      console.error("Login error:", err);
      setError(true);
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
          <div className={styles.errorBox}>
            Invalid email or password. Please try again.
          </div>
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

          {load ? (
            <div className={styles.loaderWrap}>
              <Loader />
            </div>
          ) : (
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={!email || !password}
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
