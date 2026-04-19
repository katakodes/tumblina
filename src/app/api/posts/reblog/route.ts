import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { TumblrClient } from "@/lib/tumblr/client";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Connect Tumblr before reposting." }, { status: 401 });
  }

  const body = (await request.json()) as {
    postId?: string;
    comment?: string;
    tags?: string[];
    state?: "published" | "draft" | "queue" | "private";
    blogName?: string;
  };

  if (!body.postId) {
    return NextResponse.json({ error: "postId is required." }, { status: 400 });
  }

  const [account, sourcePost] = await Promise.all([
    prisma.tumblrAccount.findFirst({
      where: { userId },
      include: {
        blogs: {
          orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.post.findUnique({ where: { id: body.postId } })
  ]);

  if (!account?.oauthTokenEncrypted || !account.oauthSecretEncrypted) {
    return NextResponse.json({ error: "Reconnect Tumblr before reposting." }, { status: 401 });
  }

  if (!sourcePost) {
    return NextResponse.json({ error: "Post was not found locally." }, { status: 404 });
  }

  if (!sourcePost.reblogKey) {
    return NextResponse.json({ error: "This post is missing a Tumblr reblog key." }, { status: 400 });
  }

  const destinationBlog =
    (body.blogName ? account.blogs.find((blog) => blog.name === body.blogName) : undefined) ??
    account.blogs.find((blog) => blog.isPrimary && blog.canPost) ??
    account.blogs.find((blog) => blog.canPost) ??
    account.blogs[0];

  if (!destinationBlog) {
    return NextResponse.json({ error: "No destination Tumblr blog found." }, { status: 400 });
  }

  const client = new TumblrClient({
    oauthToken: account.oauthTokenEncrypted,
    oauthSecret: account.oauthSecretEncrypted
  });

  let result: Awaited<ReturnType<typeof client.reblogPost>>;
  try {
    result = await client.reblogPost({
      blogName: destinationBlog.name,
      postId: sourcePost.tumblrId,
      reblogKey: sourcePost.reblogKey,
      comment: body.comment,
      tags: body.tags,
      state: body.state ?? "published"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[reblog] Tumblr reblog failed", {
      userId,
      localPostId: sourcePost.id,
      tumblrId: sourcePost.tumblrId,
      destinationBlog: destinationBlog.name,
      error: message
    });
    return NextResponse.json({ error: "Tumblr could not repost this post.", detail: message }, { status: 502 });
  }

  let unlike: { ok: boolean; error?: string } = { ok: false };
  try {
    await client.unlikePost({
      postId: sourcePost.tumblrId,
      reblogKey: sourcePost.reblogKey
    });
    await prisma.like.deleteMany({
      where: {
        userId,
        postId: sourcePost.id
      }
    });
    unlike = { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[reblog] reblog succeeded but unlike failed", {
      userId,
      localPostId: sourcePost.id,
      tumblrId: sourcePost.tumblrId,
      error: message
    });
    unlike = { ok: false, error: message };
  }

  return NextResponse.json({
    ok: true,
    destinationBlog: destinationBlog.name,
    result,
    unlike,
    reblogged: true,
    unliked: unlike.ok,
    removedFromLikes: unlike.ok,
    warning: unlike.ok ? undefined : "Reblog succeeded, but Tumblr did not confirm the unlike. The post may still appear in Likes."
  });
}
