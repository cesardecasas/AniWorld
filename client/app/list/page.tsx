import { redirect } from "next/navigation";
import { getServerSession } from "../../lib/server/session";

/** "My Ledger": your own list, or sign in first */
export default async function MyLedger() {
  const user = await getServerSession();
  redirect(user ? `/list/${user.id}` : "/login?next=/list");
}
