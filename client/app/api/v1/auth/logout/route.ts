import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isSameOrigin, jsonError } from "../../../../../lib/server/backend";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req.headers)) return jsonError(403, "Cross-site request blocked");
  const res = new NextResponse(null, { status: 204 });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
