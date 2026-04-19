import Link from "next/link";
import { DraftsGrid, type DraftCardData } from "@/components/drafts/drafts-grid";
import { getCurrentTumblrAccount } from "@/lib/session";
import { TumblrClient } from "@/lib/tumblr/client";
import { extractCaptionText, extractMedia, getTumblrPostId } from "@/lib/tumblr/normalize";
import type { TumblrPost } from "@/lib/tumblr/types";

export const dynamic = "force-dynamic";

type DraftsSearchParams = {
  blog?: string;
};

export default async function DraftsPage({ searchParams }: { searchParams?: Promise<DraftsSearchParams> }) {
  const params = (await searchParams) ?? {};
  const account = await getCurrentTumblrAccount();

  if (!account?.oauthTokenEncrypted || !account.oauthSecretEncrypted) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Drafts</p>
        <h1 className="mt-2 font-serif text-5xl">Connect Tumblr first.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/64">
          Drafts are private Tumblr data, so Tumblina needs an authenticated Tumblr connection before it can show them.
        </p>
        <Link href="/login" className="mt-6 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
          Connect Tumblr
        </Link>
      </main>
    );
  }

  const selectedBlog =
    account.blogs.find((blog) => blog.name === params.blog) ??
    account.blogs.find((blog) => blog.isPrimary && blog.canPost) ??
    account.blogs.find((blog) => blog.canPost) ??
    account.blogs[0];

  if (!selectedBlog) {
    return (
      <main className="mx-auto max-w-6xl px-5 py-10">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Drafts</p>
        <h1 className="mt-2 font-serif text-5xl">No connected blogs.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/64">
          Tumblr is connected, but Tumblina did not find a blog that can be checked for drafts.
        </p>
      </main>
    );
  }

  const client = new TumblrClient({
    oauthToken: account.oauthTokenEncrypted,
    oauthSecret: account.oauthSecretEncrypted
  });

  let drafts: DraftCardData[] = [];
  let error: string | undefined;

  try {
    const tumblrDrafts = await fetchAllDrafts(client, selectedBlog.name);
    drafts = tumblrDrafts.map((post) => toDraftCard(post, selectedBlog));
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught);
  }

  return (
    <main className="mx-auto max-w-7xl space-y-7 px-5 py-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/42">My Drafts</p>
          <h1 className="mt-2 font-serif text-5xl">My Drafts</h1>
          <p className="mt-3 max-w-2xl leading-7 text-ink/64">
            Unpublished Tumblr posts from @{selectedBlog.name}, gathered into a calmer grid before they leave the studio.
          </p>
        </div>
        <div className="rounded-md border border-ink/10 bg-white/72 px-4 py-3 text-sm text-ink/64">
          {error ? "Could not load drafts" : `${drafts.length} draft${drafts.length === 1 ? "" : "s"} loaded`}
        </div>
      </section>

      {account.blogs.length > 1 ? (
        <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Draft blogs">
          {account.blogs.map((blog) => (
            <Link
              key={blog.id}
              href={`/drafts?blog=${encodeURIComponent(blog.name)}`}
              className={`shrink-0 rounded-md border px-3 py-2 text-sm transition ${
                blog.name === selectedBlog.name
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/10 bg-white/72 text-ink/68 hover:bg-ink/5"
              }`}
            >
              @{blog.name}
            </Link>
          ))}
        </nav>
      ) : null}

      {error ? (
        <div className="rounded-md border border-tomato/20 bg-white/72 p-8">
          <p className="text-xs uppercase tracking-[0.18em] text-tomato">Drafts error</p>
          <h2 className="mt-2 font-serif text-3xl">Tumblr would not return drafts.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-ink/64">{error}</p>
        </div>
      ) : (
        <DraftsGrid drafts={drafts} />
      )}
    </main>
  );
}

async function fetchAllDrafts(client: TumblrClient, blogName: string) {
  const drafts: TumblrPost[] = [];
  let beforeId: string | undefined;

  for (let page = 0; page < 20; page += 1) {
    const response = await client.getDrafts(blogName, beforeId);
    const posts = response.posts ?? [];
    if (!posts.length) break;

    drafts.push(...posts);

    const nextBeforeId = getTumblrPostId(posts[posts.length - 1]);
    if (!nextBeforeId || nextBeforeId === beforeId) break;
    beforeId = nextBeforeId;
  }

  return drafts;
}

function toDraftCard(post: TumblrPost, blog: { name: string }): DraftCardData {
  const media = extractMedia(post);
  const text = extractCaptionText(post) || post.summary || post.title || "No caption saved yet.";
  const id = getTumblrPostId(post);

  return {
    id,
    blogName: post.blog_name || blog.name,
    editUrl: `https://www.tumblr.com/blog/${blog.name}/drafts`,
    imageUrl: media[0]?.url,
    title: post.title,
    text,
    type: post.type ?? "draft",
    tags: post.tags ?? [],
    date: post.date
  };
}
