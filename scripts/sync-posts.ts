import { TumblrClient } from "../src/lib/tumblr/client";
import { upsertTumblrPost } from "../src/lib/sync/import-posts";
import { prisma } from "../src/lib/db";

async function main() {
  const blogName = process.argv[2] ?? process.env.TUMBLR_DEFAULT_BLOG;
  if (!blogName) throw new Error("Pass a blog name: npm run sync:posts -- yourblog");

  const job = await prisma.syncJob.create({ data: { type: "posts", status: "running", startedAt: new Date() } });
  try {
    const client = new TumblrClient({
      oauthToken: process.env.TUMBLR_DEV_OAUTH_TOKEN,
      oauthSecret: process.env.TUMBLR_DEV_OAUTH_SECRET
    });
    const response = await client.getBlogPosts(blogName);
    for (const post of response.posts) {
      await upsertTumblrPost(post);
    }
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "succeeded", finishedAt: new Date(), importedCount: response.posts.length }
    });
    console.log(`Imported ${response.posts.length} posts from ${blogName}.`);
  } catch (error) {
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { status: "failed", finishedAt: new Date(), error: error instanceof Error ? error.message : String(error) }
    });
    throw error;
  }
}

main().finally(() => prisma.$disconnect());
