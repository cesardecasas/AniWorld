import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "../../components/AuthForm";
import { getServerSession } from "../../lib/server/session";
import { safeNext } from "../../lib/safeNext";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { next } = await searchParams;
  if (await getServerSession()) redirect("/");
  return <AuthForm mode="signup" next={safeNext(next)} />;
}
