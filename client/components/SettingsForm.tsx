"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, apiError } from "../lib/api";
import { queryKeys } from "../lib/queries";
import { buttonStyles, inputStyles } from "./ui/States";
import type { UserInfo } from "../types";

export function SettingsForm({ info }: { info: UserInfo }) {
  const router = useRouter();
  const client = useQueryClient();
  const [form, setForm] = useState({ userName: info.userName, email: info.email ?? "" });
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const dirty = form.userName !== info.userName || form.email !== (info.email ?? "");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      await api.patch(`/users/${info.id}`, form);
      client.setQueryData(queryKeys.session, { id: info.id, userName: form.userName });
      setStatus({ kind: "ok", text: "Saved." });
      router.refresh();
    } catch (err) {
      setStatus({ kind: "error", text: apiError(err, "Couldn't save your changes.") });
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await api.delete(`/users/${info.id}`);
      await api.post("/auth/logout").catch(() => undefined);
      // A full reload so nothing from the deleted session lingers
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/");
    } catch (err) {
      setDeleteError(apiError(err, "Couldn't delete your account."));
      setDeleting(false);
    }
  };

  return (
    <>
      <section aria-labelledby="profile" className="flex flex-col gap-5 rounded-[14px] border border-rune bg-crypt p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="profile" className="font-display text-[28px] font-semibold">
            Profile
          </h2>
          <Link href={`/list/${info.id}`} className="text-sm font-semibold">
            View your ledger →
          </Link>
        </div>
        <form onSubmit={save} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-[13px] text-ash">
            Username
            <input
              required
              minLength={3}
              maxLength={30}
              autoComplete="username"
              value={form.userName}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              className={inputStyles}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ash">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputStyles}
            />
          </label>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={busy || !dirty} className={buttonStyles.primary}>
              {busy ? "Saving…" : "Save changes"}
            </button>
            {status && (
              <p role={status.kind === "error" ? "alert" : "status"} className={`text-sm ${status.kind === "error" ? "text-crimson-light" : "text-gold"}`}>
                {status.text}
              </p>
            )}
          </div>
        </form>
      </section>

      <section aria-labelledby="danger" className="flex flex-col gap-4 rounded-[14px] border border-crimson/50 p-6 sm:p-8">
        <h2 id="danger" className="font-display text-[28px] font-semibold text-crimson-light">
          Delete account
        </h2>
        <p className="text-[15px] leading-relaxed text-ash">
          This permanently removes your account, your ledger and your reviews. It cannot be undone.
        </p>
        <label className="flex flex-col gap-1.5 text-[13px] text-ash">
          Type your username, <strong className="text-parchment">{info.userName}</strong>, to confirm
          <input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} autoComplete="off" className={inputStyles} />
        </label>
        <div>
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleting || confirmDelete !== info.userName}
            className="inline-flex h-12 items-center rounded-full border border-crimson px-6 text-[15px] font-bold text-crimson-light hover:bg-crimson hover:text-on-crimson disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </div>
        {deleteError && (
          <p role="alert" className="text-sm text-crimson-light">
            {deleteError}
          </p>
        )}
      </section>
    </>
  );
}
