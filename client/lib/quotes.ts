import type { Quote } from "../types";

const FALLBACK: Quote = {
  content:
    "In this world, evil can arise from the best of intentions. And there is good which can come from evil intentions.",
  anime: { id: 456, name: "Code Geass" },
  character: { id: 689, name: "C.C." },
};

/** A random quote from Animechan, or a fixed one when it is unavailable. Cached for an hour. */
export async function getQuote(): Promise<Quote> {
  try {
    const res = await fetch("https://api.animechan.io/v1/quotes/random", {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return FALLBACK;
    const body = await res.json();
    return body?.data?.content ? body.data : FALLBACK;
  } catch {
    return FALLBACK;
  }
}
