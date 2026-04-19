import { prisma } from "../src/lib/db";
import { analyzeImageUrl } from "../src/lib/color/analyze";

async function main() {
  const force = process.argv.includes("--force");
  const assets = await prisma.mediaAsset.findMany({
    where: force ? { postId: { not: null } } : { dominantColorHex: null },
    take: 100,
    include: { post: true }
  });

  for (const asset of assets) {
    const color = await analyzeImageUrl(asset.url).catch(() => undefined);
    if (!color) continue;
    await prisma.mediaAsset.update({ where: { id: asset.id }, data: color });
    if (asset.postId) {
      await prisma.post.update({
        where: { id: asset.postId },
        data: {
          dominantColorHex: color.dominantColorHex,
          dominantColorName: color.dominantColorName,
          paletteHexes: color.paletteHexes,
          paletteNames: color.paletteNames,
          paletteSwatches: color.paletteSwatches,
          brightnessScore: color.brightnessScore,
          saturationScore: color.saturationScore
        }
      });
    }
  }

  console.log(`Analyzed ${assets.length} media assets.`);
}

main().finally(() => prisma.$disconnect());
