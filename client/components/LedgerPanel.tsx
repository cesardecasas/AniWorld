"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STATUS_OPTIONS, statusLabel, useEntry, useRemoveEntry, useSaveEntry, useSession, type EntryChanges } from "../lib/queries";
import { apiError } from "../lib/api";
import { buttonStyles } from "./ui/States";
import type { ContentType, EntryStatus } from "../types";

export const STATUS_COLORS: Record<EntryStatus, string> = {
  in_progress: "text-sky",
  completed: "text-gold",
  on_hold: "text-amber",
  planned: "text-ash",
  dropped: "text-crimson-light",
};

interface LedgerPanelProps {
  type: ContentType;
  contentId: string;
  /** Episodes or chapters, when known */
  total: number | null;
  /** Server-rendered facts shown under the controls */
  children?: React.ReactNode;
}

export function LedgerPanel({ type, contentId, total, children }: LedgerPanelProps) {
  const pathname = usePathname() ?? "/";
  const { data: user, isPending: sessionPending } = useSession();
  const { data: entry, isPending: entryPending, isError } = useEntry(type, contentId, Boolean(user));
  const save = useSaveEntry(type, contentId);
  const remove = useRemoveEntry(type, contentId);
  const unit = type === "anime" ? "episode" : "chapter";

  // Show the value being saved straight away, so rapid clicks feel instant
  const progress = save.isPending && save.variables?.progress !== undefined ? save.variables.progress : (entry?.progress ?? 0);

  const update = (changes: EntryChanges) => {
    const next = { ...changes };
    if (next.status === "completed" && total) next.progress = total;
    if (next.progress !== undefined && total && next.progress >= total && entry?.status === "in_progress") next.status = "completed";
    if (next.progress !== undefined && next.progress > 0 && entry?.status === "planned") next.status = "in_progress";
    save.mutate(next);
  };

  const error = save.error ?? remove.error;

  let body: React.ReactNode;
  if (sessionPending || (user && entryPending)) {
    body = <div className="h-40 animate-pulse rounded-lg bg-vault" aria-label="Loading your ledger" />;
  } else if (!user) {
    body = (
      <div className="flex flex-col gap-4">
        <p className="text-[15px] leading-relaxed text-ash">Sign in to track your {unit}s, rate it, and keep it in your ledger.</p>
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className={buttonStyles.primary}>
          Sign in
        </Link>
      </div>
    );
  } else if (isError) {
    body = <p className="text-[15px] text-ash">Your ledger is unavailable right now. Please try again in a moment.</p>;
  } else if (!entry) {
    body = (
      <div className="flex flex-col gap-3">
        <button type="button" className={buttonStyles.primary} disabled={save.isPending} onClick={() => update({ status: "planned" })}>
          {save.isPending ? "Adding…" : "Add to Ledger"}
        </button>
        <button
          type="button"
          className={buttonStyles.secondary}
          disabled={save.isPending}
          onClick={() => update({ status: "in_progress" })}
        >
          {type === "anime" ? "I'm watching it" : "I'm reading it"}
        </button>
      </div>
    );
  } else {
    const pct = total ? Math.min(100, Math.round((progress / total) * 100)) : null;
    body = (
      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-[13px] text-ash">
          Status
          <select
            value={entry.status}
            onChange={(e) => update({ status: e.target.value as EntryStatus })}
            className="h-11 rounded-lg border border-rune-strong bg-obsidian px-3 text-[15px] text-parchment focus:border-gold focus:outline-none"
          >
            {STATUS_OPTIONS[type].map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-[13px] text-ash" id={`${contentId}-progress`}>
            Progress
          </span>
          <div className="flex items-center gap-2.5" role="group" aria-labelledby={`${contentId}-progress`}>
            <button
              type="button"
              aria-label={`One ${unit} back`}
              disabled={progress <= 0}
              onClick={() => update({ progress: progress - 1 })}
              className="h-11 w-11 rounded-lg border border-rune-strong bg-obsidian text-xl text-parchment hover:border-gold disabled:opacity-40"
            >
              −
            </button>
            <span className="flex-1 text-center font-display text-3xl font-semibold" aria-live="polite">
              {progress} {total ? <span className="text-lg text-ash-dim">/ {total}</span> : null}
            </span>
            <button
              type="button"
              aria-label={`One ${unit} forward`}
              disabled={total != null && progress >= total}
              onClick={() => update({ progress: progress + 1 })}
              className="h-11 w-11 rounded-lg border border-rune-strong bg-obsidian text-xl text-parchment hover:border-gold disabled:opacity-40"
            >
              +
            </button>
          </div>
          {pct != null && (
            <div className="h-1 rounded-sm bg-rune" aria-hidden="true">
              <div className="h-full rounded-sm bg-gold transition-[width]" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-[13px] text-ash">Your rating</legend>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
              const on = entry.rating != null && n <= entry.rating;
              return (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n} out of 10`}
                  aria-pressed={entry.rating === n}
                  onClick={() => update({ rating: entry.rating === n ? null : n })}
                  className={`h-8 rounded border text-xs font-bold ${
                    on ? "border-gold bg-gold text-obsidian" : "border-rune-strong bg-obsidian text-ash hover:border-gold"
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button type="button" className={buttonStyles.quiet} disabled={remove.isPending} onClick={() => remove.mutate(entry.id)}>
          {remove.isPending ? "Removing…" : "Remove from ledger"}
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Your ledger"
      className="flex flex-col gap-5 rounded-[14px] border border-rune bg-crypt p-6 lg:sticky lg:top-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[26px] font-semibold">Your ledger</h2>
        {entry && (
          <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${STATUS_COLORS[entry.status]}`}>
            {statusLabel(type, entry.status)}
          </span>
        )}
      </div>
      {body}
      {error && (
        <p role="alert" className="text-sm text-crimson-light">
          {apiError(error)}
        </p>
      )}
      {children}
    </aside>
  );
}
