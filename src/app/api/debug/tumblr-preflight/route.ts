import { NextResponse } from "next/server";
import { getTumblrOAuthEnvSummary } from "@/lib/tumblr/env";
import { preflightConsumerKey } from "@/lib/tumblr/oauth1";

export async function GET() {
  try {
    const result = await preflightConsumerKey();
    return NextResponse.json({
      message: "Tumblr public API-key preflight for the configured OAuth Consumer Key.",
      env: getTumblrOAuthEnvSummary(),
      result
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Could not run Tumblr preflight.",
        env: getTumblrOAuthEnvSummary(),
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
