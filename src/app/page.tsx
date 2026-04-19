import Link from "next/link";
import Image from "next/image";
import { Archive, Eye, Search, SlidersHorizontal } from "lucide-react";

const colorFilters = [
  ["black", "#111111"],
  ["white", "#f7f6f2"],
  ["gray", "#8b8b86"],
  ["brown", "#9d7a55"],
  ["red", "#b13a3e"],
  ["pink", "#d984a5"],
  ["orange", "#cf6b32"],
  ["yellow", "#d4b84c"],
  ["green", "#5f7a54"],
  ["blue", "#326d8f"],
  ["purple", "#8062a0"]
];

const features = [
  {
    title: "My Archives",
    description: "Browse your published Tumblr posts by month, color, tag, and memory.",
    icon: Archive,
    href: "/archive"
  },
  {
    title: "Likes",
    description: "Move through saved posts by mood, color, tag, and memory.",
    icon: Archive,
    href: "/likes"
  },
  {
    title: "Preview before posting",
    description: "Check how drafts feel before they leave the studio.",
    icon: Eye,
    href: "/preview"
  }
];

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-69px)] items-center bg-[#fbfaf7] px-5 py-8 text-ink md:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Image src="/tumblina_icon_512.png" alt="" width={148} height={148} className="mb-6 rounded-md" priority />
          <h1 className="text-base font-semibold uppercase tracking-[0.32em] text-ink/64 md:text-xl">
            KATALINA&apos;S TUMBLR STUDIO
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-ink/66">
            Search by mood, color, tag, month, source, and memory. Keep Tumblr as the source of truth while this becomes
            the place where curation feels effortless.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/likes" className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-paper">
              Browse likes
            </Link>
            <Link href="/capture/inbox" className="rounded-md border border-[#e4dfd6] bg-white px-5 py-3 text-sm font-medium text-ink">
              Open captures
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-5xl space-y-3 md:mt-10">
          <div className="flex min-h-14 items-center gap-3 rounded-md border border-[#e8e4dc] bg-white px-5 shadow-none">
            <Search className="h-5 w-5 shrink-0 text-ink/38" />
            <input
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink/38"
              placeholder="Search likes, tags, or anything..."
            />
            <button className="ml-auto inline-flex items-center gap-2 rounded-md border border-[#e6e1d8] bg-white px-4 py-2 text-sm text-ink/70">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="overflow-x-auto pb-1">
            <div className="flex w-max min-w-full gap-2">
              {colorFilters.map(([label, hex]) => (
                <Link
                  key={label}
                  href={`/likes?color=${label}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-[#e8e4dc] bg-white px-3 py-1.5 text-sm text-ink/68"
                >
                  <span className="h-3.5 w-3.5 rounded-sm border border-ink/10" style={{ backgroundColor: hex }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href} className="rounded-md border border-[#e8e4dc] bg-white/70 p-5 transition hover:border-[#d8d1c5] hover:bg-white">
              <feature.icon className="h-5 w-5 text-ink/58" />
              <h2 className="mt-4 font-serif text-2xl">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink/58">{feature.description}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
