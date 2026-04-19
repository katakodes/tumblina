import { NextRequest, NextResponse } from "next/server";
import { TumblrClient } from "@/lib/tumblr/client";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag") ?? request.nextUrl.searchParams.get("q");
  if (!tag) return NextResponse.json({ posts: [], message: "Pass ?tag= or ?q= to search Tumblr." });

  const client = new TumblrClient();
  const posts = await client.getTagged(tag).catch((error: Error) => {
    return { error: error.message };
  });
  return NextResponse.json(posts);
}
