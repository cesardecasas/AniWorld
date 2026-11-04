"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { User } from "../types";

/** Query keys in one place so invalidations can't drift from the queries they target */
export const queryKeys = {
  session: ["session"] as const,
  entry: (type: string, id: string) => ["entry", type, id] as const,
  comments: (contentId: string) => ["comments", contentId] as const,
  user: (id: string | number) => ["user", String(id)] as const,
};

/** The signed-in user, or null. The session lives in an httpOnly cookie, so ask the server. */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: async (): Promise<User | null> => {
      try {
        const res = await api.get("/auth/session");
        return res.data.user;
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
    onSuccess: () => client.clear(),
  });
}
