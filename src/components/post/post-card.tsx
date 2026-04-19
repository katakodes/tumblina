"use client";

import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { RepostButton } from "@/components/post/repost-button";
import { getTumblrDisplayImageUrl } from "@/lib/media/display-url";

export type PostCardData = {
  id: string;
  imageUrl?: string;
  blogName: string;
  title?: string;
  caption: string;
  summary?: string;
  tags: string[];
  dominantColorHex: string;
  dominantColorName: string;
  postUrl?: string;
  canRepost?: boolean;
};

export function PostCard({
  post,
  onRemoved,
  showRepostAction = true
}: {
  post: PostCardData;
  onRemoved?: (postId: string) => void;
  showRepostAction?: boolean;
}) {
  const [removed, setRemoved] = useState(false);
  const textPreview = post.summary || post.caption || post.title || "Text post";
  const textTitle = post.title && post.title !== textPreview ? post.title : undefined;
  const displayImageUrl = post.imageUrl ? getTumblrDisplayImageUrl(post.imageUrl) : undefined;

  if (removed) return null;

  return (
    <article className="masonry-item flex h-[560px] flex-col overflow-hidden rounded-md border border-ink/10 bg-white/80 shadow-sm">
      <div className="relative h-[340px] w-full shrink-0 bg-bone">
        {displayImageUrl ? (
          // Native lazy loading keeps large Tumblr grids from fetching every image at once.
          <img src={displayImageUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col justify-center gap-4 p-7">
            {textTitle ? <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/42">{textTitle}</p> : null}
            <p className="line-clamp-8 font-serif text-2xl leading-snug text-ink/82">{textPreview}</p>
          </div>
        )}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-semibold">{post.blogName}</p>
          <span className="flex items-center gap-1 rounded-md bg-bone px-2 py-1 text-xs text-ink/70">
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: post.dominantColorHex }} />
            {post.dominantColorName}
          </span>
        </div>
        <p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-ink/72">{post.imageUrl ? post.caption : textPreview}</p>
        <div className="flex min-h-[28px] flex-wrap gap-1.5 overflow-hidden">
          {post.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-md bg-ink/5 px-2 py-1 text-xs text-ink/62">
              #{tag}
            </span>
          ))}
        </div>
        <div className="mt-auto flex min-h-[42px] flex-wrap items-start gap-2">
          {post.postUrl ? (
            <a href={post.postUrl} className="inline-flex items-center gap-1 rounded-md px-0 py-2 text-xs font-medium text-ocean">
              Open Tumblr <ExternalLink className="h-3 w-3" />
            </a>
          ) : null}
          {showRepostAction ? (
            <RepostButton
              postId={post.id}
              disabled={!post.canRepost}
              onRemoved={() => {
                setRemoved(true);
                onRemoved?.(post.id);
              }}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
