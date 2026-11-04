"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, apiError } from "../lib/api";
import { STATUS_OPTIONS, statusLabel } from "../lib/queries";
import { STATUS_COLORS } from "./LedgerPanel";
import { MessageState, buttonStyles, inputStyles } from "./ui/States";
import type { ContentType, EntryStatus, ListEntry } from "../types";

export interface LedgerRow extends ListEntry {
  title: string;
  image: string | null;
  total: number | null;
  meta: string | null;
  href: string;
}

const DOT: Record<EntryStatus, string> = {
  in_progress: "bg-sky",
  completed: "bg-gold",
  on_hold: "bg-amber",
  planned: "bg-ash",
  dropped: "bg-crimson-light",
};

export function ListTable({ rows: initial, isOwner }: { rows: LedgerRow[]; isOwner: boolean }) {
  const [rows, setRows] = useState(initial);
  const [tab, setTab] = useState<ContentType>(() => (initial.some((r) => r.content_type === "anime") || !initial.length ? "anime" : "manga"));
  const [filter, setFilter] = useState<EntryStatus | "all">("all");
  const [editing, setEditing] = useState<number | null>(null);

  const ofType = rows.filter((r) => r.content_type === tab);
  const shown = ofType
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const count = (s: EntryStatus) => ofType.filter((r) => r.status === s).length;

  const tabButton = (t: ContentType, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === t}
      onClick={() => {
        setTab(t);
        setFilter("all");
        setEditing(null);
      }}
      className={`h-[52px] border-b-2 pt-3 font-display text-2xl font-semibold ${
        tab === t ? "border-gold text-parchment" : "border-transparent text-ash-dim hover:text-parchment"
      }`}
    >
      {label} <span className="font-sans text-sm font-medium text-ash-dim">{rows.filter((r) => r.content_type === t).length}</span>
    </button>
  );

  const pill = (value: EntryStatus | "all", label: string, n: number) => (
    <button
      key={value}
      type="button"
      aria-pressed={filter === value}
      onClick={() => setFilter(value)}
      className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${
        filter === value ? "border-parchment bg-parchment text-obsidian" : "border-rune-strong text-parchment-soft hover:border-gold"
      }`}
    >
      {label} <span className={filter === value ? "text-obsidian/60" : "text-ash-dim"}>{n}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-rune">
        <div role="tablist" aria-label="Media type" className="flex gap-7">
          {tabButton("anime", "Anime")}
          {tabButton("manga", "Manga")}
        </div>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filter by status">
        {pill("all", "All", ofType.length)}
        {STATUS_OPTIONS[tab].map((o) => pill(o.value, o.label, count(o.value)))}
      </div>

      {shown.length === 0 ? (
        <MessageState as="h2" title={ofType.length ? "Nothing with this status" : "An empty page"} action={isOwner && !ofType.length ? <Link href={tab === "anime" ? "/search" : "/manga"} className="text-sm font-semibold">Find something to {tab === "anime" ? "watch" : "read"} →</Link> : null}>
          {ofType.length ? "Try another filter." : isOwner ? `Your ${tab} ledger is empty.` : `No ${tab} recorded yet.`}
        </MessageState>
      ) : (
        <div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rune text-xs uppercase tracking-[0.12em] text-ash-dim">
                <th scope="col" className="py-3 pr-4 font-semibold">Title</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Status</th>
                <th scope="col" className="hidden w-48 py-3 pr-4 font-semibold sm:table-cell">Progress</th>
                <th scope="col" className="py-3 pr-4 font-semibold">Rating</th>
                {isOwner && <th scope="col" className="py-3 font-semibold"><span className="sr-only">Edit</span></th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <Row
                  key={r.id}
                  row={r}
                  isOwner={isOwner}
                  editing={editing === r.id}
                  onEdit={() => setEditing(editing === r.id ? null : r.id)}
                  onSaved={(updated) => {
                    setRows((all) => all.map((x) => (x.id === r.id ? { ...x, ...updated } : x)));
                    setEditing(null);
                  }}
                  onRemoved={() => {
                    setRows((all) => all.filter((x) => x.id !== r.id));
                    setEditing(null);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface RowProps {
  row: LedgerRow;
  isOwner: boolean;
  editing: boolean;
  onEdit: () => void;
  onSaved: (entry: Partial<ListEntry>) => void;
  onRemoved: () => void;
}

function Row({ row, isOwner, editing, onEdit, onSaved, onRemoved }: RowProps) {
  const pct = row.total ? Math.min(100, Math.round((row.progress / row.total) * 100)) : null;
  const unit = row.content_type === "anime" ? "ep" : "ch";

  return (
    <>
      <tr className="border-b border-rune">
        <td className="py-3.5 pr-4">
          <Link href={row.href} className="flex items-center gap-3.5 text-parchment hover:text-gold">
            <span
              className={`relative h-[66px] w-12 flex-none overflow-hidden bg-vault ${
                row.content_type === "anime" ? "rounded-[24px_24px_4px_4px]" : "rounded"
              }`}
            >
              {row.image && <Image src={row.image} alt="" fill sizes="48px" className="object-cover" />}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="line-clamp-2 text-[15px] font-semibold">{row.title}</span>
              {row.meta && <span className="text-[13px] text-ash">{row.meta}</span>}
              <span className="text-[13px] text-ash sm:hidden">
                {row.progress}
                {row.total ? ` / ${row.total}` : ""} {unit}
              </span>
            </span>
          </Link>
        </td>
        <td className="py-3.5 pr-4">
          <span className={`inline-flex items-center gap-2 text-sm font-semibold ${STATUS_COLORS[row.status]}`}>
            <span className={`h-2 w-2 rounded-full ${DOT[row.status]}`} aria-hidden="true" />
            {statusLabel(row.content_type, row.status)}
          </span>
        </td>
        <td className="hidden py-3.5 pr-4 sm:table-cell">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-parchment-soft">
              {row.progress}
              {row.total ? ` / ${row.total}` : ""} {unit}
            </span>
            {pct != null && (
              <span className="block h-1 w-full rounded-sm bg-rune" aria-hidden="true">
                <span className="block h-full rounded-sm bg-gold" style={{ width: `${pct}%` }} />
              </span>
            )}
          </div>
        </td>
        <td className="py-3.5 pr-4 font-display text-xl font-semibold text-gold">{row.rating ?? <span className="text-ash-dim">—</span>}</td>
        {isOwner && (
          <td className="py-3.5 text-right">
            <button type="button" onClick={onEdit} aria-expanded={editing} className="text-sm font-semibold text-crimson-light hover:text-crimson-glow">
              {editing ? "Close" : "Edit"}
              <span className="sr-only"> {row.title}</span>
            </button>
          </td>
        )}
      </tr>
      {editing && (
        <tr className="border-b border-rune bg-crypt">
          <td colSpan={5} className="p-4">
            <EditEntry row={row} onSaved={onSaved} onRemoved={onRemoved} />
          </td>
        </tr>
      )}
    </>
  );
}

function EditEntry({ row, onSaved, onRemoved }: { row: LedgerRow; onSaved: RowProps["onSaved"]; onRemoved: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({ status: row.status, progress: row.progress, rating: row.rating ?? 0, notes: row.notes ?? "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
      router.refresh(); // header stats
    } catch (err) {
      setError(apiError(err));
      setBusy(false);
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const changes = { ...form, rating: form.rating || null, notes: form.notes.trim() || null };
      const { data } = await api.patch(`/entries/${row.id}`, changes);
      onSaved(data ?? changes);
    });
  };

  return (
    <form onSubmit={save} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-[1_1_160px] flex-col gap-1.5 text-[13px] text-ash">
        Status
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EntryStatus })} className={inputStyles}>
          {STATUS_OPTIONS[row.content_type].map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex w-28 flex-col gap-1.5 text-[13px] text-ash">
        Progress
        <input
          type="number"
          min={0}
          max={row.total ?? 99999}
          value={form.progress}
          onChange={(e) => setForm({ ...form, progress: Math.max(0, Number(e.target.value) || 0) })}
          className={inputStyles}
        />
      </label>
      <label className="flex w-28 flex-col gap-1.5 text-[13px] text-ash">
        Rating
        <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputStyles}>
          <option value={0}>None</option>
          {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-[2_1_220px] flex-col gap-1.5 text-[13px] text-ash">
        Notes
        <input maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputStyles} />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className="h-11 rounded-full bg-crimson px-5 font-bold text-on-crimson hover:bg-crimson-light disabled:opacity-50">
          Save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await api.delete(`/entries/${row.id}`);
              onRemoved();
            })
          }
          className={buttonStyles.quiet}
        >
          Remove
        </button>
      </div>
      {error && (
        <p role="alert" className="w-full text-sm text-crimson-light">
          {error}
        </p>
      )}
    </form>
  );
}
