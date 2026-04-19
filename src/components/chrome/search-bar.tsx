import { Search, SlidersHorizontal } from "lucide-react";

export function SearchBar({ placeholder = "Search tags, captions, blogs, colors" }: { placeholder?: string }) {
  return (
    <div className="flex min-h-14 w-full items-center gap-3 rounded-md border border-ink/10 bg-white/72 px-4 shadow-sm">
      <Search className="h-5 w-5 text-ink/46" />
      <input
        className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-ink/42"
        placeholder={placeholder}
      />
      <button className="rounded-md border border-ink/10 px-3 py-2 text-sm text-ink/68">
        <SlidersHorizontal className="mr-2 inline h-4 w-4" />
        Filters
      </button>
    </div>
  );
}
