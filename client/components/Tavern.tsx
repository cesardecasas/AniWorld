"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useComments, useDeleteComment, usePostComment, useSession } from "../lib/queries";
import { apiError } from "../lib/api";
import { timeAgo } from "../lib/format";
import { Honeypot, Turnstile, turnstileEnabled } from "./BotGuard";
import { buttonStyles } from "./ui/States";
import type { ContentType } from "../types";

/** Reviews for a title. Text between ||double bars|| is hidden until clicked. */
export function Tavern({ type, contentId }: { type: ContentType; contentId: string }) {
  const pathname = usePathname() ?? "/";
  const { data: user } = useSession();
  const { data: comments = [], isPending, isError } = useComments(contentId);
  const post = usePostComment(type, contentId);
  const remove = useDeleteComment(contentId);

  const [text, setText] = useState("");
  const [website, setWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [attempt, setAttempt] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    post.mutate(
      { content: text.trim(), website, turnstileToken },
      {
        onSuccess: () => setText(""),
        // Turnstile tokens are single-use, so every attempt gets a fresh challenge
        onSettled: () => {
          setTurnstileToken("");
          setAttempt((n) => n + 1);
        },
      },
    );
  };

  return (
    <section className="flex flex-col gap-5" aria-labelledby="tavern">
      <h2 id="tavern" className="font-display text-[30px] font-semibold">
        The tavern{" "}
        <span className="font-sans text-[15px] font-medium text-ash-dim">
          · {comments.length} {comments.length === 1 ? "voice" : "voices"}
        </span>
      </h2>

      {user ? (
        <form onSubmit={submit} className="relative flex flex-col gap-2.5">
          <label htmlFor={`review-${contentId}`} className="text-[13px] text-ash">
            Leave your mark
          </label>
          <textarea
            id={`review-${contentId}`}
            rows={3}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts — mark spoilers with ||double bars||"
            className="resize-y rounded-[10px] border border-rune bg-crypt p-3.5 text-[15px] text-parchment placeholder:text-ash-dim focus:border-gold focus:outline-none"
          />
          <Honeypot value={website} onChange={setWebsite} />
          <Turnstile key={attempt} onToken={setTurnstileToken} />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ash-dim">{text.length > 1800 ? `${2000 - text.length} characters left` : ""}</span>
            <button
              type="submit"
              disabled={post.isPending || !text.trim() || (turnstileEnabled && !turnstileToken)}
              className="h-11 rounded-full bg-crimson px-5 font-bold text-on-crimson hover:bg-crimson-light disabled:opacity-50"
            >
              {post.isPending ? "Posting…" : "Post"}
            </button>
          </div>
          {post.error && (
            <p role="alert" className="text-sm text-crimson-light">
              {apiError(post.error, "Couldn't post your review. Please try again.")}
            </p>
          )}
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-rune bg-crypt p-4">
          <p className="text-[15px] text-ash">Sign in to share your thoughts.</p>
          <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={buttonStyles.gold}>
            Sign in
          </Link>
        </div>
      )}

      {isPending ? (
        <div className="h-20 animate-pulse rounded-lg bg-crypt" aria-label="Loading reviews" />
      ) : isError ? (
        <p className="text-[15px] text-ash">Reviews are unavailable right now.</p>
      ) : comments.length === 0 ? (
        <p className="text-[15px] text-ash">No voices yet. Be the first to speak.</p>
      ) : (
        <ul className="flex flex-col">
          {comments.map((c) => {
            const name = c.User?.userName ?? "Former member";
            return (
              <li key={c.id} className="flex gap-3.5 border-t border-rune py-[18px]">
                <span
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-rune font-display text-xl text-gold"
                  aria-hidden="true"
                >
                  {name.charAt(0).toUpperCase()}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                    {c.User ? (
                      <Link href={`/list/${c.User.id}`} className="font-bold text-parchment hover:text-gold">
                        {name}
                      </Link>
                    ) : (
                      <strong className="text-parchment">{name}</strong>
                    )}
                    <span className="text-ash-dim">
                      · <time dateTime={c.createdAt}>{timeAgo(c.createdAt)}</time>
                    </span>
                    {user && String(user.id) === String(c.user_id) && (
                      <button
                        type="button"
                        onClick={() => remove.mutate(c.id)}
                        disabled={remove.isPending}
                        className="ml-auto text-xs text-ash-dim hover:text-crimson-light"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-line break-words text-[15px] leading-relaxed text-parchment-soft">
                    <WithSpoilers text={c.content} />
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function WithSpoilers({ text }: { text: string }) {
  const parts = text.split(/\|\|([\s\S]+?)\|\|/g);
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Spoiler key={i}>{part}</Spoiler> : <span key={i}>{part}</span>))}
    </>
  );
}

function Spoiler({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  if (shown) return <span className="rounded bg-vault px-1">{children}</span>;
  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className="rounded bg-rune-strong px-1.5 text-[13px] font-semibold text-ash hover:text-parchment"
    >
      Spoiler · reveal
    </button>
  );
}
