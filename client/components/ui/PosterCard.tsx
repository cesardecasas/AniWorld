import Image from "next/image";
import Link from "next/link";
import { ScoreBadge } from "./Chip";

interface PosterCardProps {
  href: string;
  title: string;
  image: string | null;
  meta?: string | null;
  score?: number | null;
  /** Anime posters are arched; manga covers keep their printed rectangle */
  shape?: "arch" | "rect";
  priority?: boolean;
}

export function PosterCard({ href, title, image, meta, score, shape = "arch", priority }: PosterCardProps) {
  const radius = shape === "arch" ? "rounded-[var(--radius-arch-sm)]" : "rounded-md";
  return (
    <Link href={href} className="group flex flex-col gap-2.5 text-parchment hover:text-parchment">
      <div
        className={`relative aspect-[2/3] overflow-hidden border border-rune bg-crypt transition-colors group-hover:border-gold ${radius}`}
      >
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 200px, (min-width: 640px) 25vw, 45vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center font-display text-7xl italic text-rune-strong"
            aria-hidden="true"
          >
            {title.charAt(0)}
          </span>
        )}
        <ScoreBadge score={score ?? null} className="absolute bottom-3 left-3" />
      </div>
      <span className="line-clamp-2 text-[15px] font-semibold leading-snug">{title}</span>
      {meta && <span className="-mt-1.5 text-[13px] text-ash">{meta}</span>}
    </Link>
  );
}

export function PosterGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:gap-6">
      {children}
    </div>
  );
}
