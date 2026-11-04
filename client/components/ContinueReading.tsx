"use client";

import Link from "next/link";
import { useProgress, useSession } from "../lib/queries";
import { buttonStyles } from "./ui/States";

/** "Continue at chapter N" when the reader has saved progress, else a link to the first chapter */
export function ContinueReading({ mangaId, firstChapterId }: { mangaId: string; firstChapterId: string | null }) {
  const { data: user } = useSession();
  const { data: progress } = useProgress(mangaId, Boolean(user));

  if (progress) {
    return (
      <Link href={`/chapter/${progress.chapter_id}`} className={buttonStyles.primary}>
        Continue · Chapter {progress.chapter_number}
      </Link>
    );
  }
  if (!firstChapterId) return null;
  return (
    <Link href={`/chapter/${firstChapterId}`} className={buttonStyles.primary}>
      Start reading
    </Link>
  );
}
