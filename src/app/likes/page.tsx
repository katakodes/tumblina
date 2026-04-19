import { ColorChipBar } from "@/components/color/color-chip-bar";
import { LikesControls } from "@/components/likes/likes-controls";
import { SyncLikesButton } from "@/components/likes/sync-likes-button";
import { PostCard, type PostCardData } from "@/components/post/post-card";
import { meaningfulPaletteNames, matchesAnyColor, type WeightedPaletteSwatch } from "@/lib/color/taxonomy";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { toTagList } from "@/lib/utils";

export const dynamic = "force-dynamic";
const LIKES_LOAD_LIMIT = 120;
const INITIAL_VISIBLE_POSTS = 12;

type LikesSearchParams = {
  q?: string;
  color?: string;
  tag?: string;
  media?: string;
  type?: string;
};

export default async function LikesPage({ searchParams }: { searchParams?: Promise<LikesSearchParams> }) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim();
  const color = params.color?.trim();
  const tag = params.tag?.trim();
  const media = params.media?.trim();
  const type = params.type?.trim();
  const userId = await getCurrentUserId();
  const totalLocalLikes = userId ? await prisma.like.count({ where: { userId } }) : await prisma.like.count();

  const likes = await prisma.like.findMany({
    where: {
      ...(userId ? { userId } : {}),
      post: {
        hidden: false,
        ...(type ? { type: type as never } : {}),
        ...(query
          ? {
              OR: [
                { captionText: { contains: query } },
                { blogName: { contains: query } },
                { postUrl: { contains: query } },
                { summary: { contains: query } }
              ]
            }
          : {})
      }
    },
    include: {
      post: {
        include: {
          media: { orderBy: [{ width: "desc" }, { height: "desc" }], take: 1 }
        }
      }
    },
    orderBy: [{ likedAt: "desc" }, { createdAt: "desc" }],
    take: LIKES_LOAD_LIMIT
  });

  const posts = likes
    .map((like): PostCardData | null => {
      const tags = toTagList(like.post.tags);
      const paletteNames = toTagList(like.post.paletteNames);
      const hasImage = Boolean(like.post.media[0]?.url);
      const meaningfulNames = meaningfulPaletteNames(
        Array.isArray(like.post.paletteSwatches) ? (like.post.paletteSwatches as WeightedPaletteSwatch[]) : [],
        [like.post.dominantColorName, ...paletteNames].filter(Boolean) as string[]
      );
      if (tag && !tags.includes(tag)) return null;
      if (media === "image" && !hasImage) return null;
      if (media === "text" && hasImage) return null;
      if (color && !matchesAnyColor(meaningfulNames, [color])) return null;
      return {
        id: like.post.id,
        imageUrl: like.post.media[0]?.url,
        blogName: like.post.blogName,
        title: like.post.title ?? undefined,
        caption: like.post.captionText || like.post.summary || "No caption saved yet.",
        summary: like.post.summary ?? undefined,
        tags,
        dominantColorHex: like.post.dominantColorHex ?? "#777672",
        dominantColorName: like.post.dominantColorName ?? "unanalyzed",
        postUrl: like.post.postUrl ?? undefined,
        canRepost: Boolean(like.post.reblogKey)
      };
    })
    .filter(Boolean) as PostCardData[];

  const visiblePosts = posts.slice(0, INITIAL_VISIBLE_POSTS);
  const allTags = [...new Set(likes.flatMap((like) => toTagList(like.post.tags)))].slice(0, 24);
  const analyzed = likes.filter((like) => like.post.dominantColorHex).length;
  const hasFilters = Boolean(color || tag || query || media || type);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[1fr_340px]">
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Likes library</p>
            <h1 className="mt-2 font-serif text-5xl">Saved signals</h1>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <p className="text-sm text-ink/58">
              {totalLocalLikes} local likes · {likes.length} in current search · {posts.length} matching · {visiblePosts.length} showing ·{" "}
              {likes.length ? Math.round((analyzed / likes.length) * 100) : 0}% color analyzed
            </p>
            <SyncLikesButton />
          </div>
        </div>
        <LikesControls tags={allTags} />
        <div className="space-y-2">
          <p className="text-sm text-ink/58">Color filters use broad palette families, like green, red, blue, and brown.</p>
          {likes.length < LIKES_LOAD_LIMIT ? (
            <p className="rounded-md border border-pollen/30 bg-pollen/10 px-3 py-2 text-sm text-ink/68">
              Only {totalLocalLikes} likes are local right now. Sync more likes to make color filters representative of your full library.
            </p>
          ) : null}
          <ColorChipBar selected={color ? [color] : []} hrefBase="/likes" />
        </div>
        {visiblePosts.length ? (
          <div className="masonry">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-ink/10 bg-white/72 p-8">
            <h2 className="font-serif text-3xl">{hasFilters && likes.length ? "No matches for this filter" : "No synced likes yet"}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-ink/64">
              {hasFilters && likes.length
                ? `You have ${likes.length} synced likes, but none currently match ${[
                    color ? `color ${color}` : "",
                    tag ? `tag #${tag}` : "",
                    media ? `media ${media}` : "",
                    type ? `type ${type}` : "",
                    query ? `search "${query}"` : ""
                  ]
                    .filter(Boolean)
                    .join(", ")}. Try another chip or clear the filters.`
                : "Connect Tumblr, then click Sync Tumblr likes. Once Tumblr returns liked posts, they will appear here with searchable captions, tags, source blogs, and color metadata."}
            </p>
            {hasFilters && likes.length ? (
              <a href="/likes" className="mt-5 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
                Clear filters
              </a>
            ) : null}
          </div>
        )}
      </section>
      <aside className="h-fit rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Detail panel</p>
        <h2 className="mt-2 font-serif text-3xl">Tag pivots</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {(allTags.length ? allTags : ["connect", "sync", "likes"]).map((tagName) => (
            <a key={tagName} href={`/likes?tag=${encodeURIComponent(tagName)}`} className="rounded-md bg-ink/5 px-3 py-2 text-sm text-ink/72">
              #{tagName}
            </a>
          ))}
        </div>
        <div className="mt-6 space-y-2 text-sm text-ink/64">
          <p>Bulk actions: add to collection, label, pin, hide, mark reference.</p>
          <p>Autocomplete is backed by local post tags once the first sync completes.</p>
        </div>
      </aside>
    </main>
  );
}
