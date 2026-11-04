"use client";

import Link from "next/link";
import { useEntry, useSaveEntry, useSession, statusLabel } from "../lib/queries";
import { buttonStyles } from "./ui/States";
import type { ContentType } from "../types";

/** One-click "Add to Ledger" for heroes and cards; full editing lives in LedgerPanel */
export function QuickAdd({ type, contentId, detailHref }: { type: ContentType; contentId: string; detailHref: string }) {
  const { data: user, isPending } = useSession();
  const { data: entry } = useEntry(type, contentId, Boolean(user));
  const save = useSaveEntry(type, contentId);

  if (isPending) return <span className="inline-block h-12 w-44" aria-hidden="true" />;
  if (!user) {
    return (
      <Link href={`/login?next=${encodeURIComponent(detailHref)}`} className={buttonStyles.primary}>
        <PlusIcon /> Add to Ledger
      </Link>
    );
  }
  if (entry) {
    return (
      <Link href={detailHref} className={buttonStyles.secondary}>
        In your ledger · {statusLabel(type, entry.status)}
      </Link>
    );
  }
  return (
    <button type="button" className={buttonStyles.primary} disabled={save.isPending} onClick={() => save.mutate({ status: "planned" })}>
      <PlusIcon /> {save.isPending ? "Adding…" : "Add to Ledger"}
    </button>
  );
}

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
