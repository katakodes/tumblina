import { SettingsPanel } from "@/components/settings/settings-panel";
import { prisma } from "@/lib/db";
import { getCurrentTumblrAccount, getCurrentUserId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await getCurrentUserId();
  const [account, user, likes, posts, media] = await Promise.all([
    getCurrentTumblrAccount(),
    userId
      ? prisma.user.findUnique({
          where: { id: userId },
          select: {
            defaultPublishAction: true,
            syncFrequencyMinutes: true,
            appearance: true
          }
        })
      : null,
    userId ? prisma.like.count({ where: { userId } }) : prisma.like.count(),
    prisma.post.count(),
    prisma.mediaAsset.count()
  ]);

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Settings</p>
      <h1 className="mt-2 font-serif text-5xl">Studio preferences</h1>
      <SettingsPanel
        connectedAccount={
          account
            ? {
                name: account.name ?? "tumblr",
                blogs: account.blogs.map((blog) => ({
                  name: blog.name,
                  isPrimary: blog.isPrimary,
                  canPost: blog.canPost
                }))
              }
            : null
        }
        initialSettings={
          user
            ? {
                defaultPublishAction: user.defaultPublishAction,
                syncFrequencyMinutes: user.syncFrequencyMinutes,
                appearance: user.appearance
              }
            : null
        }
        localCounts={{ likes, posts, media }}
      />
    </main>
  );
}
