import { NextResponse } from "next/server";
import { getTumblrOAuthEnvSummary } from "@/lib/tumblr/env";
import { buildAuthorizeUrl, getRequestToken, TumblrCredentialError } from "@/lib/tumblr/oauth1";

export async function GET() {
  try {
    console.info("[tumblr-oauth] starting OAuth flow", getTumblrOAuthEnvSummary());
    const token = await getRequestToken();
    const response = NextResponse.redirect(buildAuthorizeUrl(token.oauthToken));
    response.cookies.set("tumblr_oauth_token", token.oauthToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60
    });
    response.cookies.set("tumblr_oauth_token_secret", token.oauthTokenSecret, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60
    });
    return response;
  } catch (error) {
    const isCredentialError = error instanceof TumblrCredentialError;
    console.error("[tumblr-oauth] could not start OAuth flow", {
      error: error instanceof Error ? error.message : String(error),
      env: getTumblrOAuthEnvSummary()
    });
    return NextResponse.json(
      {
        error: isCredentialError ? "Tumblr rejected the configured app credentials." : "Could not start Tumblr OAuth.",
        detail: error instanceof Error ? error.message : String(error),
        nextStep: isCredentialError
          ? "In Tumblr's Applications page, register a fresh application or regenerate/copy the active OAuth Consumer Key and Secret Key. Put those into .env.local, restart npm run dev, then re-open /api/debug/tumblr-preflight."
          : "Check the masked env diagnostics and the dev-server logs."
      },
      { status: isCredentialError ? 400 : 500 }
    );
  }
}
