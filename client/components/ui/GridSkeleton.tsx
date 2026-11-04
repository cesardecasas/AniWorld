export function GridSkeleton() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-12 sm:px-8" aria-busy="true" aria-label="Loading">
      <div className="h-12 w-2/3 max-w-md animate-pulse rounded-lg bg-crypt" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-[var(--radius-arch-sm)] bg-crypt" />
        ))}
      </div>
    </div>
  );
}
