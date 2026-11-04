import Link from "next/link";
import { LogoMark } from "./Logo";

/** Centered message for empty results, missing pages and outages */
export function MessageState({
  eyebrow,
  title,
  children,
  action,
  as: Tag = "h1",
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-20 text-center">
      <LogoMark size={48} className="text-rune-strong" />
      {eyebrow && <span className="eyebrow text-gold">{eyebrow}</span>}
      <Tag className="font-display text-4xl font-semibold sm:text-5xl">{title}</Tag>
      {children && <div className="text-base leading-relaxed text-ash">{children}</div>}
      {action === undefined ? (
        <Link href="/" className="mt-2 text-sm font-semibold">
          Return to the archive →
        </Link>
      ) : (
        action
      )}
    </div>
  );
}

export const buttonStyles = {
  primary:
    "inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-crimson px-6 text-[15px] font-bold text-on-crimson transition-colors hover:bg-crimson-light hover:text-on-crimson disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex h-12 items-center justify-center rounded-full border border-rune-strong px-6 text-[15px] font-semibold text-parchment transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50",
  gold: "inline-flex h-11 items-center justify-center rounded-full border border-gold px-5 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-obsidian",
  quiet:
    "inline-flex h-11 items-center justify-center rounded-full border border-rune-strong px-5 text-sm text-ash transition-colors hover:border-crimson-light hover:text-crimson-light disabled:cursor-not-allowed disabled:opacity-50",
};

export const inputStyles =
  "h-11 w-full rounded-lg border border-rune-strong bg-obsidian px-3 text-[15px] text-parchment placeholder:text-ash-dim focus:border-gold focus:outline-none";
