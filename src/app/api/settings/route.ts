import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";

const settingsSchema = z.object({
  defaultPublishAction: z.enum(["save_only", "draft", "queue", "publish"]).optional(),
  syncFrequencyMinutes: z.coerce.number().int().min(15).max(10080).optional(),
  appearance: z.enum(["system", "light", "editorial"]).optional()
});

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Connect Tumblr before saving settings." }, { status: 401 });
  }

  const body = settingsSchema.parse(await request.json());
  const user = await prisma.user.update({
    where: { id: userId },
    data: body,
    select: {
      defaultPublishAction: true,
      syncFrequencyMinutes: true,
      appearance: true
    }
  });

  return NextResponse.json({ ok: true, settings: user });
}
