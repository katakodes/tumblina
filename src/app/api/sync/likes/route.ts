import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { TumblrClient } from "@/lib/tumblr/client";
import { upsertTumblrPost } from "@/lib/sync/import-posts";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    pages?: number;
    pageSize?: number;
    reset?: boolean;
    strategy?: "offset" | "before";
  };
  const pages = Math.max(1, Math.min(Number(body.pages ?? 3), 10));
  const pageSize = Math.max(1, Math.min(Number(body.pageSize ?? 16), 16));
  const cookieStore = await cookies();
  const userId = cookieStore.get("tumblr_studio_user_id")?.value;

  if (!userId) {
    return NextResponse.json(
      {
        error: "Not connected to Tumblr.",
        nextStep: "Go to /login, complete Tumblr auth, then return to /likes and sync again."
      },
      { status: 401 }
    );
  }

  const account = await prisma.tumblrAccount.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" }
  });

  if (!account?.oauthTokenEncrypted || !account.oauthSecretEncrypted) {
    return NextResponse.json(
      {
        error: "Missing Tumblr OAuth token.",
        nextStep: "Reconnect Tumblr from /login so the app can save a usable OAuth token."
      },
      { status: 401 }
    );
  }

  const client = new TumblrClient({
    oauthToken: account.oauthTokenEncrypted,
    oauthSecret: account.oauthSecretEncrypted
  });

  const posts = [];
  let total = 0;
  const strategy = body.strategy ?? "before";
  const lastJob = await prisma.syncJob.findFirst({
    where: { userId, type: "likes", status: "succeeded" },
    orderBy: { finishedAt: "desc" }
  });
  let before = body.reset || strategy === "offset" ? undefined : Number(lastJob?.cursor || undefined);
  let offset = body.reset ? 0 : await prisma.like.count({ where: { userId } });
  const startedAtOffset = offset;
  const startedBefore = before;

  const job = await prisma.syncJob.create({
    data: {
      userId,
      type: "likes",
      status: "running",
      startedAt: new Date(),
      cursor: before ? String(before) : null
    }
  });

  try {
    for (let page = 0; page < pages; page += 1) {
      const response =
        strategy === "offset"
          ? await client.getUserLikes({ offset, limit: pageSize })
          : await client.getUserLikes({ before, limit: pageSize });
      total = response.liked_count;
      console.info("[likes-sync] fetched page", {
        page: page + 1,
        strategy,
        offset: strategy === "offset" ? offset : undefined,
        before,
        received: response.liked_posts.length,
        tumblrTotal: total
      });
      if (!response.liked_posts.length) break;

      for (const post of response.liked_posts) {
        const likedAt = post.liked_timestamp ? new Date(post.liked_timestamp * 1000) : new Date();
        const saved = await upsertTumblrPost(post, { likedAt, analyzeColors: false });
        await prisma.like.upsert({
          where: {
            userId_postId: {
              userId,
              postId: saved.id
            }
          },
          update: { likedAt: saved.likedAt ?? likedAt },
          create: {
            userId,
            postId: saved.id,
            likedAt: saved.likedAt ?? likedAt
          }
        });
        posts.push(saved);
      }

      offset += response.liked_posts.length;
      const timestamps = response.liked_posts.flatMap((post) =>
        typeof post.liked_timestamp === "number" ? [post.liked_timestamp] : []
      );
      if (timestamps.length) before = Math.min(...timestamps) - 1;
      if (strategy === "offset" && offset >= total) break;
    }

    const localTotal = await prisma.like.count({ where: { userId } });
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "succeeded",
        finishedAt: new Date(),
        importedCount: posts.length,
        cursor: before ? String(before) : null
      }
    });

    return NextResponse.json({
      imported: posts.length,
      total,
      localTotal,
      pages,
      pageSize,
      strategy,
      startedAtOffset,
      nextOffset: offset,
      startedBefore,
      nextBefore: before
    });
  } catch (error) {
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        importedCount: posts.length,
        error: error instanceof Error ? error.message : String(error)
      }
    });
    throw error;
  }
}
