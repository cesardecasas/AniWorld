"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { AppComment, ContentType, EntryStatus, ListEntry, ReadingProgress, User } from "../types";

/** Query keys in one place so invalidations can't drift from the queries they target */
export const queryKeys = {
  session: ["session"] as const,
  entry: (type: ContentType, id: string) => ["entry", type, id] as const,
  comments: (contentId: string) => ["comments", contentId] as const,
  progress: (mangaId: string) => ["progress", mangaId] as const,
};

/* ── Session ───────────────────────────────────────── */

/** The signed-in user, or null. The session is an httpOnly cookie, so only the server knows. */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async (): Promise<User | null> => {
      try {
        return (await api.get("/auth/session")).data.user;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useLogout() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.post("/auth/logout"),
    onSettled: () => {
      client.clear();
      client.setQueryData(queryKeys.session, null);
    },
  });
}

/* ── Ledger entries ────────────────────────────────── */

export type EntryChanges = Partial<Pick<ListEntry, "status" | "progress" | "rating" | "notes">>;

export function useEntry(type: ContentType, contentId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.entry(type, contentId),
    queryFn: async (): Promise<ListEntry | null> => (await api.get(`/me/entries/${type}/${encodeURIComponent(contentId)}`)).data,
    enabled,
  });
}

/** Creates the entry on first save, updates it after that */
export function useSaveEntry(type: ContentType, contentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (changes: EntryChanges): Promise<ListEntry> =>
      (await api.put("/me/entries", { content_type: type, content_id: contentId, ...changes })).data,
    onSuccess: (entry) => client.setQueryData(queryKeys.entry(type, contentId), entry),
  });
}

export function useRemoveEntry(type: ContentType, contentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (entryId: number) => api.delete(`/entries/${entryId}`),
    onSuccess: () => client.setQueryData(queryKeys.entry(type, contentId), null),
  });
}

export const STATUS_OPTIONS: Record<ContentType, { value: EntryStatus; label: string }[]> = {
  anime: [
    { value: "in_progress", label: "Watching" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On hold" },
    { value: "planned", label: "Plan to watch" },
    { value: "dropped", label: "Dropped" },
  ],
  manga: [
    { value: "in_progress", label: "Reading" },
    { value: "completed", label: "Completed" },
    { value: "on_hold", label: "On hold" },
    { value: "planned", label: "Plan to read" },
    { value: "dropped", label: "Dropped" },
  ],
};

export const statusLabel = (type: ContentType, status: EntryStatus) =>
  STATUS_OPTIONS[type].find((o) => o.value === status)?.label ?? status;

/* ── Reviews ───────────────────────────────────────── */

export function useComments(contentId: string) {
  return useQuery({
    queryKey: queryKeys.comments(contentId),
    queryFn: async (): Promise<AppComment[]> => (await api.get(`/titles/${encodeURIComponent(contentId)}/comments`)).data,
  });
}

export interface NewComment {
  content: string;
  website: string;
  turnstileToken: string;
}

export function usePostComment(type: ContentType, contentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (comment: NewComment): Promise<AppComment> =>
      (await api.post("/comments", { owner_id: contentId, type, ...comment })).data,
    onSuccess: (comment) => {
      // The API quietly accepts honeypot hits without creating anything, so only add real comments
      if (comment?.id) client.setQueryData<AppComment[]>(queryKeys.comments(contentId), (prev = []) => [comment, ...prev]);
    },
  });
}

export function useDeleteComment(contentId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => api.delete(`/comments/${commentId}`),
    onSuccess: (_, commentId) =>
      client.setQueryData<AppComment[]>(queryKeys.comments(contentId), (prev = []) => prev.filter((c) => c.id !== commentId)),
  });
}

/* ── Reading progress ──────────────────────────────── */

export function useProgress(mangaId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.progress(mangaId),
    queryFn: async (): Promise<ReadingProgress | null> => (await api.get(`/me/progress/${mangaId}`)).data,
    enabled,
  });
}
