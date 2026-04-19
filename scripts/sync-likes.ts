import { TumblrClient } from "../src/lib/tumblr/client";
import { upsertTumblrPost } from "../src/lib/sync/import-posts";
import { prisma } from "../src/lib/db";

async function main() {
  const job = await prisma.syncJob.create({ data: { type: "likes", status: "running", startedAt: new Date() } });
  try {
    const client = new TumblrClient({
      oauthToken: process.env.TUMBLR_DEV_OAUTH_TOKEN,
      oauthSecret: process.env.TUMBLR_DEV_OAUTH_SECRET
    });
    const response = await client.getUserLikes();
    for (const post of response.liked_posts) {
      await upsertTumblrPost(post);
    }
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "succeeded", finishedAt: new Date(), importedCount: response.liked_posts.length }
    });
    console.log(`Imported ${response.liked_posts.length} likes.`);
  } catch (error) {
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), error: error instanceof Error ? error.message : String(error) }
    });
    throw error;
  }
}

main().finally(() => prisma.$disconnect());
