import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { analyzeImageUrl } from "@/lib/color/analyze";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-capture-secret");
  if (process.env.CAPTURE_SHARED_SECRET && secret !== process.env.CAPTURE_SHARED_SECRET) {
    return NextResponse.json({ error: "Invalid capture secret." }, { status: 401 });
  }

  const body = (await request.json()) as {
    sourcePageUrl?: string;
    sourcePageTitle?: string;
    selectedImageUrl?: string;
    selectedText?: string;
    altText?: string;
  };

  if (!body.sourcePageUrl) {
    return NextResponse.json({ error: "sourcePageUrl is required." }, { status: 400 });
  }

  const capture = await prisma.capture.create({
    data: {
      sourcePageUrl: body.sourcePageUrl,
      sourcePageTitle: body.sourcePageTitle,
      selectedImageUrl: body.selectedImageUrl,
      selectedText: body.selectedText,
      altText: body.altText,
      media: body.selectedImageUrl
        ? {
            create: await buildMedia(body.selectedImageUrl, body.altText)
          }
        : undefined
    },
    include: { media: true }
  });

  return NextResponse.json({ capture });
}

async function buildMedia(url: string, altText?: string) {
  const color = await analyzeImageUrl(url).catch(() => undefined);
  return {
    url,
    altText,
    dominantColorHex: color?.dominantColorHex,
    dominantColorName: color?.dominantColorName,
    paletteHexes: color?.paletteHexes ?? [],
    paletteNames: color?.paletteNames ?? [],
    brightnessScore: color?.brightnessScore,
    saturationScore: color?.saturationScore
  };
}
