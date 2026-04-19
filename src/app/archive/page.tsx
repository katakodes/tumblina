import Link from "next/link";
import { ColorChipBar } from "@/components/color/color-chip-bar";
import { PostCard, type PostCardData } from "@/components/post/post-card";
import { meaningfulPaletteNames, matchesAnyColor, type WeightedPaletteSwatch } from "@/lib/color/taxonomy";
import { prisma } from "@/lib/db";
import { getCurrentTumblrAccount } from "@/lib/session";
import { toTagList } from "@/lib/utils";

export const dynamic = "force-dynamic";
const INITIAL_VISIBLE_POSTS = 12;

type ArchiveSearchParams = {
  blog?: string;
  year?: string;
  month?: string;
  color?: string;
  tag?: string;
  q?: string;
  before?: string;
};

type ArchivePost = Awaited<ReturnType<typeof loadArchivePosts>>["posts"][number];

export default async function ArchivePage({ searchParams }: { searchParams?: Promise<ArchiveSearchParams> }) {
  const params = (await searchParams) ?? {};
  const account = await getCurrentTumblrAccount();

  if (!account?.oauthTokenEncrypted || !account.oauthSecretEncrypted) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Archives</p>
        <h1 className="mt-2 font-serif text-5xl">Connect Tumblr first.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/64">
          Published post archives belong to your Tumblr account, so Tumblina needs a connected blog before it can browse them.
        </p>
        <Link href="/login" className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
          Connect Tumblr
        </Link>
      </main>
    );
  }

  const selectedBlog =
    account.blogs.find((blog) => blog.name === params.blog) ??
    account.blogs.find((blog) => blog.isPrimary) ??
    account.blogs[0];

  if (!selectedBlog) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Archives</p>
        <h1 className="mt-2 font-serif text-5xl">No connected blogs.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/64">Tumblina did not find a Tumblr blog to browse.</p>
      </main>
    );
  }

  const archive = await loadArchivePosts({
    blogId: selectedBlog.id,
    params
  });

  const selectedYear = normalizeYear(params.year);
  const selectedMonth = normalizeMonth(params.month);
  const color = params.color?.trim();
  const tag = params.tag?.trim();
  const query = params.q?.trim().toLowerCase();

  const filteredPosts = archive.posts.filter((post) => {
    const tags = toTagList(post.tags);
    const paletteNames = toTagList(post.paletteNames);
    const meaningfulNames = meaningfulPaletteNames(
      Array.isArray(post.paletteSwatches) ? (post.paletteSwatches as WeightedPaletteSwatch[]) : [],
      [post.dominantColorName, ...paletteNames].filter(Boolean) as string[]
    );
    const searchable = [post.captionText, post.summary, post.title, post.blogName, post.postUrl, ...tags].filter(Boolean).join(" ").toLowerCase();

    if (tag && !tags.includes(tag)) return false;
    if (color && !matchesAnyColor(meaningfulNames, [color])) return false;
    if (query && !searchable.includes(query)) return false;
    return true;
  });

  const visiblePosts = filteredPosts.slice(0, INITIAL_VISIBLE_POSTS).map(toPostCard);
  const months = buildMonthOptions(archive.posts);
  const tags = [...new Set(archive.posts.flatMap((post) => toTagList(post.tags)))].slice(0, 32);
  const hasFilters = Boolean(selectedYear || selectedMonth || color || tag || query);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit space-y-6 rounded-md border border-ink/10 bg-white/72 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Archives</p>
          <h1 className="mt-2 font-serif text-4xl">Published posts</h1>
          <p className="mt-3 text-sm leading-6 text-ink/58">Browse @{selectedBlog.name} by month, palette, tag, and text.</p>
        </div>

        {account.blogs.length > 1 ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-ink/42">Blog</p>
            <div className="flex flex-wrap gap-2">
              {account.blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={archiveHref({ blog: blog.name })}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    blog.name === selectedBlog.name ? "border-ink bg-ink text-paper" : "border-ink/10 bg-white text-ink/68"
                  }`}
                >
                  @{blog.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <form action="/archive" className="space-y-4">
          <input type="hidden" name="blog" value={selectedBlog.name} />
          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-sm text-ink/64">
              <span>Year</span>
              <select name="year" defaultValue={selectedYear ?? ""} className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-ink">
                <option value="">All</option>
                {uniqueYears(months).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm text-ink/64">
              <span>Month</span>
              <select name="month" defaultValue={selectedMonth ?? ""} className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-ink">
                <option value="">All</option>
                {monthNames.map((label, index) => (
                  <option key={label} value={String(index + 1).padStart(2, "0")}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1 text-sm text-ink/64">
            <span>Search</span>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Caption, title, tag..."
              className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-ink outline-none placeholder:text-ink/34"
            />
          </label>

          <label className="space-y-1 text-sm text-ink/64">
            <span>Tag</span>
            <select name="tag" defaultValue={tag ?? ""} className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-ink">
              <option value="">All tags</option>
              {tags.map((tagName) => (
                <option key={tagName} value={tagName}>
                  #{tagName}
                </option>
              ))}
            </select>
          </label>

          {color ? <input type="hidden" name="color" value={color} /> : null}
          <button type="submit" className="w-full rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
            Apply filters
          </button>
          {hasFilters ? (
            <Link href={archiveHref({ blog: selectedBlog.name })} className="block text-center text-sm font-medium text-ocean">
              Clear filters
            </Link>
          ) : null}
        </form>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.16em] text-ink/42">Months</p>
          <div className="max-h-72 space-y-1 overflow-auto pr-1">
            {months.slice(0, 36).map((month) => (
              <Link
                key={month.key}
                href={archiveHref({ blog: selectedBlog.name, year: String(month.year), month: String(month.month).padStart(2, "0"), color, tag, q: params.q })}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm transition hover:bg-ink/5"
              >
                <span>{month.label}</span>
                <span className="text-ink/44">{month.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </aside>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink/42">
              {selectedYear ? `${monthLabel(selectedMonth)} ${selectedYear}`.trim() : "All published posts"}
            </p>
            <h2 className="font-serif text-5xl">My Archives</h2>
          </div>
          <div className="rounded-md border border-ink/10 bg-white/72 px-4 py-3 text-sm text-ink/64">
            {filteredPosts.length} matching · {visiblePosts.length} showing
          </div>
        </div>

        <div className="rounded-md border border-ink/10 bg-white/72 px-4 py-3 text-sm text-ink/64">
          Showing locally synced posts. To fetch new posts from Tumblr, use the{" "}
          <Link href="/settings" className="font-medium text-ocean hover:underline">
            sync settings
          </Link>
          .
        </div>

        <div className="space-y-2">
          <p className="text-sm text-ink/58">Color filters use the same broad palette families as Likes.</p>
          <ColorChipBar
            selected={color ? [color] : []}
            hrefBase="/archive"
            params={{
              blog: selectedBlog.name,
              year: selectedYear,
              month: selectedMonth,
              tag,
              q: params.q
            }}
          />
        </div>

        {visiblePosts.length ? (
          <div className="masonry">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} showRepostAction={false} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-ink/10 bg-white/72 p-10">
            <h2 className="font-serif text-3xl">No archived posts found for these filters</h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink/64">
              Try clearing a filter or choosing another month.
            </p>
            {hasFilters ? (
              <Link href={archiveHref({ blog: selectedBlog.name })} className="mt-5 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
                Clear filters
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

async function loadArchivePosts(input: {
  blogId: string;
  params: ArchiveSearchParams;
}) {
  const selectedYear = normalizeYear(input.params.year);
  const selectedMonth = normalizeMonth(input.params.month);
  const dateRange = selectedYear ? getDateRange(selectedYear, selectedMonth) : null;

  const posts = await prisma.post.findMany({
    where: {
      blogId: input.blogId,
      state: "published",
      hidden: false,
      ...(dateRange
        ? {
            timestamp: {
              gte: dateRange.start,
              lt: dateRange.end
            }
          }
        : {})
    },
    include: {
      media: { orderBy: [{ width: "desc" }, { height: "desc" }], take: 1 }
    },
    orderBy: [{ timestamp: "desc" }, { createdAt: "desc" }],
    take: 500
  });

  return { posts };
}

function toPostCard(post: ArchivePost): PostCardData {
  const tags = toTagList(post.tags);
  return {
    id: post.id,
    imageUrl: post.media[0]?.url,
    blogName: post.blogName,
    title: post.title ?? undefined,
    caption: post.captionText || post.summary || "No caption saved yet.",
    summary: post.summary ?? undefined,
    tags,
    dominantColorHex: post.dominantColorHex ?? "#777672",
    dominantColorName: post.dominantColorName ?? "unanalyzed",
    postUrl: post.postUrl ?? undefined,
    canRepost: false
  };
}

function buildMonthOptions(posts: ArchivePost[]) {
  const counts = new Map<string, { year: number; month: number; label: string; count: number; key: string }>();
  for (const post of posts) {
    if (!post.timestamp) continue;
    const year = post.timestamp.getFullYear();
    const month = post.timestamp.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        year,
        month,
        key,
        label: `${monthNames[month - 1]} ${year}`,
        count: 1
      });
    }
  }
  return [...counts.values()].sort((a, b) => b.key.localeCompare(a.key));
}

function uniqueYears(months: ReturnType<typeof buildMonthOptions>) {
  return [...new Set(months.map((month) => month.year))];
}

function normalizeYear(value?: string) {
  if (!value || !/^\d{4}$/.test(value)) return null;
  return Number(value);
}

function normalizeMonth(value?: string) {
  if (!value || !/^\d{1,2}$/.test(value)) return null;
  const month = Number(value);
  if (month < 1 || month > 12) return null;
  return String(month).padStart(2, "0");
}

function getDateRange(year: number, month?: string | null) {
  if (!month) {
    return {
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1)
    };
  }
  const monthIndex = Number(month) - 1;
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 1)
  };
}

function monthLabel(month?: string | null) {
  if (!month) return "";
  return monthNames[Number(month) - 1] ?? "";
}

function archiveHref(params: Record<string, string | number | null | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const serialized = query.toString();
  return serialized ? `/archive?${serialized}` : "/archive";
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
