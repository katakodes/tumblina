import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { TumblrClient } from "@/lib/tumblr/client";
import { exchangeAccessToken } from "@/lib/tumblr/oauth1";

export async function GET(request: NextRequest) {
  const oauthToken = request.nextUrl.searchParams.get("oauth_token");
  const oauthVerifier = request.nextUrl.searchParams.get("oauth_verifier");
  const storedToken = request.cookies.get("tumblr_oauth_token")?.value;
  const storedSecret = request.cookies.get("tumblr_oauth_token_secret")?.value;

  if (!oauthToken || !oauthVerifier || !storedToken || !storedSecret || oauthToken !== storedToken) {
    return NextResponse.redirect(new URL("/login?error=oauth_mismatch", request.url));
  }

  try {
    const access = await exchangeAccessToken({
      oauthToken,
      oauthTokenSecret: storedSecret,
      oauthVerifier
    });

    const client = new TumblrClient({
      oauthToken: access.oauthToken,
      oauthSecret: access.oauthTokenSecret
    });
    const info = await client.getUserInfo();
    const tumblrName = info.user.name;
    const rawUser = info.user as unknown as Prisma.InputJsonValue;

    const user = await prisma.user.upsert({
      where: { email: `tumblr:${tumblrName}` },
      update: { name: tumblrName },
      create: {
        email: `tumblr:${tumblrName}`,
        name: tumblrName
      }
    });

    const account = await prisma.tumblrAccount.upsert({
      where: { id: `tumblr:${tumblrName}` },
      update: {
        userId: user.id,
        name: tumblrName,
        oauthTokenEncrypted: access.oauthToken,
        oauthSecretEncrypted: access.oauthTokenSecret,
        rawUser
      },
      create: {
        id: `tumblr:${tumblrName}`,
        userId: user.id,
        name: tumblrName,
        oauthTokenEncrypted: access.oauthToken,
        oauthSecretEncrypted: access.oauthTokenSecret,
        rawUser
      }
    });

    for (const blog of info.user.blogs ?? []) {
      const rawBlog = blog as unknown as Prisma.InputJsonValue;
      await prisma.blog.upsert({
        where: {
          accountId_name: {
            accountId: account.id,
            name: blog.name
          }
        },
        update: {
          tumblrUuid: blog.uuid,
          title: blog.title,
          url: blog.url,
          avatarUrl: blog.avatar?.[0]?.url,
          isPrimary: Boolean(blog.primary),
          canPost: Boolean(blog.can_post),
          rawBlog
        },
        create: {
          accountId: account.id,
          tumblrUuid: blog.uuid,
          name: blog.name,
          title: blog.title,
          url: blog.url,
          avatarUrl: blog.avatar?.[0]?.url,
          isPrimary: Boolean(blog.primary),
          canPost: Boolean(blog.can_post),
          rawBlog
        }
      });
    }

    const response = NextResponse.redirect(new URL("/onboarding?connected=1", request.url));
    response.cookies.delete("tumblr_oauth_token");
    response.cookies.delete("tumblr_oauth_token_secret");
    response.cookies.set("tumblr_studio_user_id", user.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
    return response;
  } catch (error) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "oauth_callback_failed");
    url.searchParams.set("detail", error instanceof Error ? error.message : String(error));
    return NextResponse.redirect(url);
  }
}
