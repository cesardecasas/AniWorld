import Image from "next/image";

/** The large gold-framed key art on detail pages: arched for anime, rectangular for manga */
export function ArchCover({ src, alt, shape = "arch" }: { src: string | null; alt: string; shape?: "arch" | "rect" }) {
  const outer = shape === "arch" ? "rounded-[130px_130px_8px_8px]" : "rounded-lg";
  const inner = shape === "arch" ? "rounded-[122px_122px_4px_4px]" : "rounded";
  return (
    <div className={`aspect-[5/7] w-full border border-gold p-2 ${outer}`}>
      <div className={`relative h-full w-full overflow-hidden bg-vault ${inner}`}>
        {src && <Image src={src} alt={alt} fill priority sizes="260px" className="object-cover" />}
      </div>
    </div>
  );
}
