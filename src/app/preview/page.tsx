import Image from "next/image";
import { demoPosts } from "@/lib/demo-data";

export default function PreviewPage() {
  const post = demoPosts[0];
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[420px_1fr]">
      <section className="rounded-md border border-ink/10 bg-white/74 p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Preview studio</p>
        <h1 className="mt-2 font-serif text-5xl">Before it lands</h1>
        <div className="mt-6 space-y-4">
          <input className="w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="Post title" />
          <textarea className="min-h-44 w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="Caption" />
          <input className="w-full rounded-md border border-ink/12 bg-paper px-3 py-3" placeholder="tags, separated, by, commas" />
          <select className="w-full rounded-md border border-ink/12 bg-paper px-3 py-3">
            <option>Save as draft</option>
            <option>Queue</option>
            <option>Publish now</option>
            <option>Internal library only</option>
          </select>
        </div>
      </section>
      <section className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {["Single post", "Feed card", "Blog grid", "Archive"].map((view, index) => (
            <button key={view} className={`rounded-md px-4 py-2 text-sm ${index === 0 ? "bg-ink text-paper" : "border border-ink/12"}`}>
              {view}
            </button>
          ))}
        </div>
        <article className="max-w-2xl rounded-md border border-ink/10 bg-white p-6 shadow-editorial">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold">{post.blogName}</p>
            <p className="text-sm text-ink/46">Approximate Tumblr rendering</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-bone">
            <Image src={post.imageUrl ?? "/placeholder.svg"} alt="" fill className="object-cover" />
          </div>
          <p className="mt-5 leading-7 text-ink/74">{post.caption}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="text-sm text-ocean">
                #{tag}
              </span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
