import { NextRequest, NextResponse } from "next/server";
import { TumblrClient } from "@/lib/tumblr/client";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const client = new TumblrClient({
    oauthToken: body.oauthToken,
    oauthSecret: body.oauthSecret
  });

  const post = await client.createNpfPost({
    blogName: body.blogName,
    state: body.state ?? "draft",
    tags: body.tags ?? [],
    sourceUrl: body.sourceUrl,
    content: body.content ?? []
  });

  return NextResponse.json({ post });
}
