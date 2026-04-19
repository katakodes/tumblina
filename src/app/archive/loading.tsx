export default function ArchiveLoading() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit space-y-5 rounded-md border border-ink/10 bg-white/72 p-5">
        <div className="h-4 w-28 animate-pulse rounded-md bg-ink/10" />
        <div className="h-10 w-48 animate-pulse rounded-md bg-ink/10" />
        <div className="h-24 animate-pulse rounded-md bg-ink/5" />
        <div className="h-40 animate-pulse rounded-md bg-ink/5" />
      </aside>
      <section className="space-y-5">
        <div className="h-16 w-72 animate-pulse rounded-md bg-ink/10" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[560px] animate-pulse rounded-md border border-ink/10 bg-white/72" />
          ))}
        </div>
      </section>
    </main>
  );
}
