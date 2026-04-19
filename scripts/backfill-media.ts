import type { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/db";
import { extractMedia } from "../src/lib/tumblr/normalize";
import type { TumblrPost } from "../src/lib/tumblr/types";

async function main() {
  const posts = await prisma.post.findMany({
    take: 500
  });

  let updated = 0;
  for (const post of posts) {
    const raw = (post.npf ?? post.legacy) as TumblrPost | null;
    if (!raw) continue;

    const media = Array.from(new Map(extractMedia(raw).map((asset) => [asset.url, asset])).values());
    if (!media.length) continue;

    await prisma.mediaAsset.deleteMany({ where: { postId: post.id } });

    for (const asset of media) {
      await prisma.mediaAsset.create({
        data: {
          id: `${post.id}:${asset.url}`,
          postId: post.id,
          url: asset.url,
          width: asset.width,
          height: asset.height,
          altText: asset.altText,
          dominantColorHex: post.dominantColorHex,
          dominantColorName: post.dominantColorName,
          paletteHexes: post.paletteHexes as Prisma.InputJsonValue,
          paletteNames: post.paletteNames as Prisma.InputJsonValue,
          paletteSwatches: post.paletteSwatches as Prisma.InputJsonValue
        }
      });
    }
    updated += 1;
  }

  console.log(`Backfilled media variants for ${updated} posts.`);
}

main().finally(() => prisma.$disconnect());
