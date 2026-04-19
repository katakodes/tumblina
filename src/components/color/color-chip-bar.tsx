import { BROAD_COLOR_TAXONOMY } from "@/lib/color/taxonomy";

export function ColorChipBar({
  selected = [],
  hrefBase = "/explore",
  params = {}
}: {
  selected?: string[];
  hrefBase?: string;
  params?: Record<string, string | number | null | undefined>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {BROAD_COLOR_TAXONOMY.map((color) => (
        <a
          key={color.name}
          href={chipHref(hrefBase, { ...params, color: color.name })}
          className="group flex items-center gap-2 rounded-md border border-ink/10 bg-white/68 px-2.5 py-2 text-xs text-ink/72 transition hover:-translate-y-0.5 hover:shadow-sm"
        >
          <span
            className="h-4 w-4 rounded-sm border border-ink/12"
            style={{ backgroundColor: color.hex }}
            aria-hidden
          />
          <span className={selected.includes(color.name) ? "font-semibold text-ink" : ""}>{color.label}</span>
        </a>
      ))}
    </div>
  );
}

function chipHref(hrefBase: string, params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `${hrefBase}?${serialized}` : hrefBase;
}
