/** The AniWorld mark: a crescent inside a diamond */
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
      className={className}
    >
      <path d="M14 2 L26 14 L14 26 L2 14 Z" />
      <path d="M18 8 A7 7 0 1 0 18 20 A5.5 5.5 0 1 1 18 8 Z" />
    </svg>
  );
}
