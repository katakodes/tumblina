import Image from "next/image";
import { demoPosts } from "@/lib/demo-data";

export default function CaptureInboxPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Capture inbox</p>
      <h1 className="mt-2 font-serif text-5xl">Saved from Safari</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {demoPosts.map((post) => (
          <article key={post.id} className="rounded-md border border-ink/10 bg-white/76 p-4 shadow-sm">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bone">
              <Image src={post.imageUrl ?? "/placeholder.svg"} alt="" fill className="object-cover" />
            </div>
            <h2 className="mt-4 font-serif text-3xl">{post.blogName}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/64">{post.caption}</p>
            <div className="mt-4 flex gap-2">
              <button className="rounded-md bg-ink px-3 py-2 text-sm text-paper">Draft</button>
              <button className="rounded-md border border-ink/12 px-3 py-2 text-sm">Library</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
