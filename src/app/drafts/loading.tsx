export default function DraftsLoading() {
  return (
    <main className="mx-auto max-w-7xl space-y-7 px-5 py-8">
      <section className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Drafts</p>
        <div className="h-12 w-56 animate-pulse rounded-md bg-ink/10" />
        <div className="h-6 w-full max-w-2xl animate-pulse rounded-md bg-ink/5" />
      </section>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-[560px] animate-pulse rounded-md border border-ink/10 bg-white/72" />
        ))}
      </div>
    </main>
  );
}
