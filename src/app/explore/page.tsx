import { ColorChipBar } from "@/components/color/color-chip-bar";
import { SearchBar } from "@/components/chrome/search-bar";
import { PostCard } from "@/components/post/post-card";
import { demoPosts } from "@/lib/demo-data";

export default function ExplorePage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5 rounded-md border border-ink/10 bg-white/66 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Explore</p>
            <h1 className="mt-2 font-serif text-4xl">Public search</h1>
          </div>
          <div className="space-y-3 text-sm">
            {["Photo", "Video", "Text", "Link", "Quote", "Audio"].map((type) => (
              <label key={type} className="flex items-center gap-2 text-ink/70">
                <input type="checkbox" className="h-4 w-4 accent-ink" />
                {type}
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Sort</p>
            <select className="w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm">
              <option>Newest</option>
              <option>Color similarity</option>
              <option>Most relevant when available</option>
            </select>
          </div>
        </aside>
        <section className="space-y-5">
          <SearchBar placeholder="Search Tumblr tags or keywords" />
          <ColorChipBar selected={["sage", "pink"]} />
          <div className="masonry">
            {demoPosts.concat(demoPosts).map((post, index) => (
              <PostCard key={`${post.id}-${index}`} post={post} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
