/** A large number over a small label; use inside a <dl> */
export function Stat({ value, label, accent = false }: { value: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      <dt className="text-xs uppercase tracking-[0.1em] text-ash-dim">{label}</dt>
      <dd className={`font-display text-4xl font-semibold leading-none ${accent ? "text-gold" : ""}`}>{value}</dd>
    </div>
  );
}
