import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("tumblr_studio_user_id")?.value ?? null;
}

export async function getCurrentTumblrAccount() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.tumblrAccount.findFirst({
    where: { userId },
    include: {
      blogs: {
        orderBy: [{ isPrimary: "desc" }, { name: "asc" }]
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}
