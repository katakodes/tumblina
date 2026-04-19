import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [likes, posts, media, jobs] = await Promise.all([
    prisma.like.count(),
    prisma.post.count(),
    prisma.mediaAsset.count(),
    prisma.syncJob.findMany({
      where: { type: "likes" },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const withMedia = await prisma.like.count({
    where: {
      post: {
        media: {
          some: {}
        }
      }
    }
  });

  return NextResponse.json({
    local: {
      likes,
      posts,
      media,
      likesWithMedia: withMedia,
      textOrNoMediaLikes: likes - withMedia
    },
    jobs: jobs.map((job) => ({
      id: job.id,
      status: job.status,
      importedCount: job.importedCount,
      cursor: job.cursor,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      error: job.error
    }))
  });
}
