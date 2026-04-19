import Image from "next/image";
import { demoPosts } from "@/lib/demo-data";

export default function CollectionsPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Collections</p>
      <h1 className="mt-2 font-serif text-5xl">Folders for visual memory</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {["Interior references", "Color studies", "Post ideas"].map((name, index) => (
          <article key={name} className="overflow-hidden rounded-md border border-ink/10 bg-white/76 shadow-sm">
            <div className="grid h-52 grid-cols-2 gap-1">
              {demoPosts.slice(0, 4).map((post) => (
                <div key={post.id} className="relative min-h-0">
                  <Image src={post.imageUrl ?? "/placeholder.svg"} alt="" fill className="object-cover" sizes="220px" />
                </div>
              ))}
            </div>
            <div className="p-4">
              <h2 className="font-serif text-3xl">{name}</h2>
              <p className="mt-2 text-sm text-ink/58">{24 + index * 13} items · updated recently</p>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
