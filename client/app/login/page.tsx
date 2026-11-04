import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "../../components/AuthForm";
import { getServerSession } from "../../lib/server/session";
import { safeNext } from "../../lib/safeNext";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string; registered?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getServerSession();
  // "/list" alone means "my ledger", which needs to know who you are
  const resolve = (path: string, id: number) => (path === "/list" ? `/list/${id}` : path);
  if (user) redirect(resolve(safeNext(params.next), user.id));

  return (
    <AuthForm
      mode="login"
      next={safeNext(params.next)}
      notice={params.registered ? "Your account is ready. Sign in to begin your ledger." : undefined}
    />
  );
}
