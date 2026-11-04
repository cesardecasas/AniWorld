import { NextResponse } from "next/server";
import { getRandomManga } from "../../../lib/mangadex";

// A different manga on every request
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const manga = await getRandomManga();
    return NextResponse.redirect(new URL(`/manga/${manga.id}`, req.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/manga", req.url), 303);
  }
}
