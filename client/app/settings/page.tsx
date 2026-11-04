import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { backendFetch } from "../../lib/server/backend";
import { getServerSession, getSessionToken } from "../../lib/server/session";
import { SettingsForm } from "../../components/SettingsForm";
import { MessageState } from "../../components/ui/States";
import type { UserInfo } from "../../types";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getServerSession();
  if (!user) redirect("/login?next=/settings");

  const res = await backendFetch(`/users/${user.id}`, { token: await getSessionToken() }).catch(() => null);
  if (!res?.ok) {
    return (
      <MessageState title="Settings are unavailable">
        The AniWorld API isn&apos;t responding. Please try again in a minute.
      </MessageState>
    );
  }
  const info = (await res.json()) as UserInfo;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 pt-12 sm:px-8">
      <div className="flex flex-col gap-1.5">
        <span className="eyebrow">Your account</span>
        <h1 className="font-display text-5xl font-semibold leading-none">Settings</h1>
      </div>
      <SettingsForm info={info} />
    </div>
  );
}
