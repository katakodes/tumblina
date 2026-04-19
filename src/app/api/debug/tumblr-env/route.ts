import { NextResponse } from "next/server";
import { getTumblrOAuthEnvSummary } from "@/lib/tumblr/env";

export async function GET() {
  return NextResponse.json({
    message:
      "Masked Tumblr OAuth runtime env. Compare the fingerprints and first/last characters with the Tumblr app dashboard.",
    ...getTumblrOAuthEnvSummary()
  });
}
