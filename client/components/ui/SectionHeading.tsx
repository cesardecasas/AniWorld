import Link from "next/link";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, action, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <div className="flex flex-col gap-1.5">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <Tag className="font-display text-4xl font-semibold leading-tight">{title}</Tag>
      </div>
      {action && (
        <Link href={action.href} className="text-sm font-semibold">
          {action.label} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}
