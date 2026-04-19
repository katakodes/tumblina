import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { analyzeImageUrl } from "@/lib/color/analyze";
import { getTumblrDisplayImageUrl } from "@/lib/media/display-url";
import { extractCaptionText, extractMedia, getTumblrPostId } from "@/lib/tumblr/normalize";
import type { TumblrPost } from "@/lib/tumblr/types";

export async function upsertTumblrPost(
  post: TumblrPost,
  options: { likedAt?: Date; blogId?: string; analyzeColors?: boolean } = {}
) {
  const tumblrId = getTumblrPostId(post);
  const media = extractMedia(post);
  const firstImage = media[0]?.url;
  const shouldAnalyzeColors = options.analyzeColors ?? true;
  const color = firstImage && shouldAnalyzeColors
    ? await analyzeImageUrl(getTumblrDisplayImageUrl(firstImage, "s500x750")).catch(() => undefined)
    : undefined;
  const npf = post.content ? (post as unknown as Prisma.InputJsonValue) : undefined;
  const legacy = post.content ? undefined : (post as unknown as Prisma.InputJsonValue);

  const saved = await prisma.post.upsert({
    where: { tumblrId_blogName: { tumblrId, blogName: post.blog_name } },
    update: {
      blogId: options.blogId,
      postUrl: post.post_url,
      shortUrl: post.short_url,
      sourceUrl: post.source_url,
      sourceTitle: post.source_title,
      reblogKey: post.reblog_key,
      type: post.type ?? "unknown",
      state: normalizeState(post.state),
      title: post.title,
      captionText: extractCaptionText(post),
      summary: post.summary,
      tags: post.tags ?? [],
      timestamp: post.timestamp ? new Date(post.timestamp * 1000) : undefined,
      likedAt: options.likedAt,
      npf,
      legacy,
      dominantColorHex: color?.dominantColorHex,
      dominantColorName: color?.dominantColorName,
      paletteHexes: color?.paletteHexes ?? [],
      paletteNames: color?.paletteNames ?? [],
      paletteSwatches: color?.paletteSwatches ?? [],
      brightnessScore: color?.brightnessScore,
      saturationScore: color?.saturationScore
    },
    create: {
      tumblrId,
      blogId: options.blogId,
      blogName: post.blog_name,
      postUrl: post.post_url,
      shortUrl: post.short_url,
      sourceUrl: post.source_url,
      sourceTitle: post.source_title,
      reblogKey: post.reblog_key,
      type: post.type ?? "unknown",
      state: normalizeState(post.state),
      title: post.title,
      captionText: extractCaptionText(post),
      summary: post.summary,
      tags: post.tags ?? [],
      timestamp: post.timestamp ? new Date(post.timestamp * 1000) : undefined,
      likedAt: options.likedAt,
      npf,
      legacy,
      dominantColorHex: color?.dominantColorHex,
      dominantColorName: color?.dominantColorName,
      paletteHexes: color?.paletteHexes ?? [],
      paletteNames: color?.paletteNames ?? [],
      paletteSwatches: color?.paletteSwatches ?? [],
      brightnessScore: color?.brightnessScore,
      saturationScore: color?.saturationScore
    }
  });

  for (const asset of media) {
    await prisma.mediaAsset.upsert({
      where: { id: `${saved.id}:${asset.url}` },
      update: {
        width: asset.width,
        height: asset.height,
        altText: asset.altText
      },
      create: {
        id: `${saved.id}:${asset.url}`,
        postId: saved.id,
        url: asset.url,
        width: asset.width,
        height: asset.height,
        altText: asset.altText,
        dominantColorHex: color?.dominantColorHex,
        dominantColorName: color?.dominantColorName,
        paletteHexes: color?.paletteHexes ?? [],
        paletteNames: color?.paletteNames ?? [],
        paletteSwatches: color?.paletteSwatches ?? []
      }
    });
  }

  return saved;
}

function normalizeState(value?: string) {
  if (value === "published" || value === "queued" || value === "draft" || value === "private" || value === "submission") {
    return value;
  }
  return "unknown";
}
