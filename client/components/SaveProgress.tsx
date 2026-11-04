"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys, useSession } from "../lib/queries";

/** Records the open chapter as the reader's place in the manga. Renders nothing. */
export function SaveProgress({ mangaId, chapterId, chapterNumber }: { mangaId: string; chapterId: string; chapterNumber: string }) {
  const { data: user } = useSession();
  const client = useQueryClient();

  useEffect(() => {
    if (!user) return;
    api
      .put("/me/progress", { manga_id: mangaId, chapter_id: chapterId, chapter_number: chapterNumber })
      .then((res) => client.setQueryData(queryKeys.progress(mangaId), res.data))
      .catch(() => undefined); // progress is a convenience; reading must never fail because of it
  }, [user, mangaId, chapterId, chapterNumber, client]);

  return null;
}
