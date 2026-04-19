import { NextRequest, NextResponse } from "next/server";
import { TumblrClient } from "@/lib/tumblr/client";
import { upsertTumblrPost } from "@/lib/sync/import-posts";

export async function POST(request: NextRequest) {
  const { blogName } = (await request.json()) as { blogName?: string };
  if (!blogName) return NextResponse.json({ error: "blogName is required." }, { status: 400 });

  const client = new TumblrClient({
    oauthToken: process.env.TUMBLR_DEV_OAUTH_TOKEN,
    oauthSecret: process.env.TUMBLR_DEV_OAUTH_SECRET
  });
  const response = await client.getBlogPosts(blogName);
  const posts = await Promise.all(response.posts.map((post) => upsertTumblrPost(post)));
  return NextResponse.json({ imported: posts.length, total: response.total_posts });
}
