import { stripHtml } from "@/lib/utils";
import type { TumblrPost } from "@/lib/tumblr/types";

type ExtractedMedia = {
  url: string;
  width?: number;
  height?: number;
  altText?: string;
};

export function getTumblrPostId(post: TumblrPost) {
  return post.id_string ?? String(post.id);
}

export function extractCaptionText(post: TumblrPost) {
  const blocks = [
    ...(Array.isArray(post.content) ? post.content : []),
    ...extractTrailBlocks(post)
  ];
  const contentText = blocks
        .map((block) => {
          if (typeof block.text === "string") return block.text;
          if (typeof block.caption === "string") return block.caption;
          return "";
        })
        .join(" ");
  return stripHtml([post.title, post.caption, post.body, post.summary, contentText].filter(Boolean).join(" "));
}

function mediaArea(media: { width?: number; height?: number }) {
  return (media.width ?? 0) * (media.height ?? 0);
}

function chooseLargestMedia(media: ExtractedMedia[]) {
  return media.sort((a, b) => mediaArea(b) - mediaArea(a))[0];
}

function extractTrailBlocks(post: TumblrPost) {
  const trail = Array.isArray(post.trail) ? post.trail : [];
  return trail.flatMap((item) => {
    if (typeof item !== "object" || item === null || !Array.isArray(item.content)) return [];
    return item.content;
  });
}

function extractImageBlocks(blocks: Array<Record<string, unknown>>) {
  return blocks.flatMap((block) => {
    if (block.type !== "image" || !Array.isArray(block.media)) return [];
    const variants = block.media.flatMap((media) => {
      if (typeof media !== "object" || media === null || typeof media.url !== "string") return [];
      return {
        url: media.url,
        width: typeof media.width === "number" ? media.width : undefined,
        height: typeof media.height === "number" ? media.height : undefined,
        altText: typeof block.alt_text === "string" ? block.alt_text : undefined
      };
    });
    const best = chooseLargestMedia(variants);
    return best ? [best] : [];
  });
}

export function extractMedia(post: TumblrPost): ExtractedMedia[] {
  const legacyPhotos =
    post.photos?.flatMap((photo) => {
      const best = chooseLargestMedia([photo.original_size, ...(photo.alt_sizes ?? [])].filter(Boolean) as ExtractedMedia[]);
      return best?.url
        ? [{ url: best.url, width: best.width, height: best.height, altText: photo.caption }]
        : [];
    }) ?? [];

  const npfMedia = extractImageBlocks([
    ...(Array.isArray(post.content) ? post.content : []),
    ...extractTrailBlocks(post)
  ]);

  return [...npfMedia, ...legacyPhotos];
}
