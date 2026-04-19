import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTumblrAccount } from "@/lib/session";
import { TumblrClient } from "@/lib/tumblr/client";

const actionSchema = z.object({
  action: z.enum(["publish", "delete"]),
  blogName: z.string().min(1),
  postId: z.string().min(1)
});

export async function POST(request: Request) {
  const account = await getCurrentTumblrAccount();
  if (!account?.oauthTokenEncrypted || !account.oauthSecretEncrypted) {
    return NextResponse.json({ error: "Connect Tumblr before managing drafts." }, { status: 401 });
  }

  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid draft action.", detail: parsed.error.flatten() }, { status: 400 });
  }

  const blog = account.blogs.find((candidate) => candidate.name === parsed.data.blogName);
  if (!blog) {
    return NextResponse.json({ error: "That blog is not connected to this account." }, { status: 403 });
  }

  const client = new TumblrClient({
    oauthToken: account.oauthTokenEncrypted,
    oauthSecret: account.oauthSecretEncrypted
  });

  try {
    if (parsed.data.action === "publish") {
      const result = await client.publishDraft({
        blogName: blog.name,
        postId: parsed.data.postId
      });

      return NextResponse.json({
        ok: true,
        action: "publish",
        blogName: blog.name,
        postId: parsed.data.postId,
        result
      });
    }

    await client.deletePost({
      blogName: blog.name,
      postId: parsed.data.postId
    });

    return NextResponse.json({
      ok: true,
      action: "delete",
      blogName: blog.name,
      postId: parsed.data.postId
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[drafts] Tumblr draft action failed", {
      action: parsed.data.action,
      blogName: blog.name,
      postId: parsed.data.postId,
      error: message
    });

    return NextResponse.json(
      {
        error: parsed.data.action === "publish" ? "Tumblr could not publish this draft." : "Tumblr could not delete this draft.",
        detail: message
      },
      { status: 502 }
    );
  }
}
