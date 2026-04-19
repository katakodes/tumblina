export default function NewPostPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-ink/10 bg-white/76 p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Composer</p>
        <h1 className="mt-2 font-serif text-5xl">Make a Tumblr post</h1>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="Title or note" />
          <input className="w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="Image URL" />
          <textarea className="min-h-52 w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="Caption" />
          <input className="w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="tags" />
        </div>
      </section>
      <aside className="h-fit rounded-md border border-ink/10 bg-white/72 p-5">
        <h2 className="font-serif text-3xl">Destination</h2>
        <select className="mt-4 w-full rounded-md border border-ink/12 bg-paper px-3 py-3">
          <option>Primary blog</option>
        </select>
        <div className="mt-4 grid gap-2">
          {["Save draft", "Queue", "Publish now", "Save only"].map((action) => (
            <button key={action} className="rounded-md border border-ink/12 px-4 py-3 text-left text-sm">
              {action}
            </button>
          ))}
        </div>
      </aside>
    </main>
  );
}
