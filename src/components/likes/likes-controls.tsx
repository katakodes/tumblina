"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type LikesControlsProps = {
  tags: string[];
};

function setOrDelete(params: URLSearchParams, key: string, value?: string) {
  if (value) params.set(key, value);
  else params.delete(key);
}

export function LikesControls({ tags }: LikesControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const activeFilters = useMemo(
    () => ["q", "color", "tag", "media", "type"].filter((key) => searchParams.get(key)),
    [searchParams]
  );

  function pushParams(next: URLSearchParams) {
    const search = next.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    setOrDelete(next, "q", query.trim());
    pushParams(next);
  }

  function applyFilter(key: string, value?: string) {
    const next = new URLSearchParams(searchParams);
    setOrDelete(next, key, value);
    pushParams(next);
  }

  function clearFilters() {
    setQuery("");
    router.push(pathname);
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={submitSearch}
        className="flex min-h-14 w-full items-center gap-3 rounded-md border border-ink/10 bg-white/72 px-4 shadow-sm"
      >
        <Search className="h-5 w-5 text-ink/46" />
        <input
          className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink/42"
          placeholder="Search tags, captions, blog names, URLs, labels"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" className="rounded-md bg-ink px-3 py-2 text-sm text-paper">
          Search
        </button>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md border border-ink/10 px-3 py-2 text-sm text-ink/68"
          aria-expanded={open}
        >
          <SlidersHorizontal className="mr-2 inline h-4 w-4" />
          Filters
          {activeFilters.length ? <span className="ml-2 text-ink/42">({activeFilters.length})</span> : null}
        </button>
      </form>

      {open ? (
        <section className="rounded-md border border-ink/10 bg-white/78 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Filters</p>
              <p className="mt-1 text-sm text-ink/60">Combine search with media, post type, tag, and color chips.</p>
            </div>
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-3 py-2 text-sm">
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-semibold">Media</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", undefined],
                  ["images", "image"],
                  ["text/no image", "text"]
                ].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => applyFilter("media", value)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      searchParams.get("media") === value || (!value && !searchParams.get("media"))
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/10 text-ink/70"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Post Type</p>
              <select
                value={searchParams.get("type") ?? ""}
                onChange={(event) => applyFilter("type", event.target.value || undefined)}
                className="w-full rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm"
              >
                <option value="">All types</option>
                <option value="blocks">Blocks / NPF</option>
                <option value="photo">Photo</option>
                <option value="text">Text</option>
                <option value="quote">Quote</option>
                <option value="link">Link</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Tags</p>
              <div className="flex max-h-28 flex-wrap gap-2 overflow-auto pr-1">
                {tags.slice(0, 18).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyFilter("tag", tag)}
                    className={`rounded-md px-3 py-2 text-sm ${
                      searchParams.get("tag") === tag ? "bg-ink text-paper" : "bg-ink/5 text-ink/72"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
