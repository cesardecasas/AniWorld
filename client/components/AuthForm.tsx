"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "../lib/api";
import { queryKeys } from "../lib/queries";
import { Honeypot, Turnstile, turnstileEnabled } from "./BotGuard";
import { LogoMark } from "./ui/Logo";
import { buttonStyles, inputStyles } from "./ui/States";

interface AuthFormProps {
  mode: "login" | "signup";
  /** Already validated as a same-site path by the page */
  next: string;
  notice?: string;
}

export function AuthForm({ mode, next, notice }: AuthFormProps) {
  const router = useRouter();
  const client = useQueryClient();
  const [fields, setFields] = useState({ userName: "", email: "", password: "" });
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (isLogin) {
        const { data } = await api.post("/auth/login", { email: fields.email, password: fields.password, turnstileToken });
        client.setQueryData(queryKeys.session, data.user);
        router.replace(next);
        router.refresh();
        return; // keep the button disabled while navigating
      }
      await api.post("/auth/register", { ...fields, website, turnstileToken });
      router.push(`/login?registered=1${next !== "/" ? `&next=${encodeURIComponent(next)}` : ""}`);
    } catch (err) {
      setError(apiError(err, isLogin ? "Invalid email or password." : "Something went wrong. Please check your details."));
      // Turnstile tokens are single-use, so every attempt gets a fresh challenge
      setTurnstileToken("");
      setAttempt((n) => n + 1);
      setBusy(false);
    }
  };

  const nextQuery = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-col gap-7 px-4 py-16 sm:py-24">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark size={40} className="text-gold" />
        <span className="eyebrow text-gold">{isLogin ? "Welcome back" : "Join the archive"}</span>
        <h1 className="font-display text-5xl font-semibold">{isLogin ? "Sign in" : "Create account"}</h1>
      </div>

      {notice && (
        <p role="status" className="rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
          {notice}
        </p>
      )}

      <form onSubmit={submit} className="relative flex flex-col gap-4 rounded-[14px] border border-rune bg-crypt p-6 sm:p-8">
        {!isLogin && (
          <label className="flex flex-col gap-1.5 text-[13px] text-ash">
            Username
            <input
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              value={fields.userName}
              onChange={set("userName")}
              className={inputStyles}
            />
          </label>
        )}
        <label className="flex flex-col gap-1.5 text-[13px] text-ash">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={fields.email}
            onChange={set("email")}
            className={inputStyles}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ash">
          Password
          <input
            type="password"
            required
            minLength={isLogin ? undefined : 8}
            maxLength={128}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={fields.password}
            onChange={set("password")}
            className={inputStyles}
          />
          {!isLogin && <span className="text-xs text-ash-dim">At least 8 characters</span>}
        </label>

        {!isLogin && <Honeypot value={website} onChange={setWebsite} />}
        <Turnstile key={attempt} onToken={setTurnstileToken} />

        {error && (
          <p role="alert" className="text-sm text-crimson-light">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy || (turnstileEnabled && !turnstileToken)} className={`${buttonStyles.primary} mt-2`}>
          {busy ? (isLogin ? "Signing in…" : "Creating account…") : isLogin ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-ash">
        {isLogin ? "New to AniWorld? " : "Already have an account? "}
        <Link href={`${isLogin ? "/signup" : "/login"}${nextQuery}`} className="font-semibold">
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
}
