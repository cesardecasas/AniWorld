/**
 * Where to send someone after signing in. Only same-site paths are allowed, so a crafted
 * ?next=https://evil.example (or //evil.example) can't turn the login page into an open redirect.
 */
export function safeNext(value: string | string[] | undefined, fallback = "/") {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  if (next.startsWith("/login") || next.startsWith("/signup")) return fallback;
  return next;
}
