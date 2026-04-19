import crypto from "node:crypto";
import { z } from "zod";

const trimmedString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim();
}, z.string());

export const tumblrOAuthEnvSchema = z.object({
  TUMBLR_CONSUMER_KEY: trimmedString.pipe(z.string().min(1)),
  TUMBLR_CONSUMER_SECRET: trimmedString.pipe(z.string().min(1)),
  TUMBLR_CALLBACK_URL: trimmedString.pipe(z.string().url()),
  TUMBLR_USER_AGENT: trimmedString.pipe(z.string().min(1)).default("Tumblr Studio/0.1")
});

export function getTumblrOAuthEnv() {
  return tumblrOAuthEnvSchema.parse(process.env);
}

export function maskSecret(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-4);
  const fingerprint = crypto.createHash("sha256").update(trimmed).digest("hex").slice(0, 10);
  return {
    present: true,
    length: trimmed.length,
    prefix,
    suffix,
    fingerprint
  };
}

export function getTumblrOAuthEnvSummary() {
  const consumerKey = process.env.TUMBLR_CONSUMER_KEY?.trim();
  const consumerSecret = process.env.TUMBLR_CONSUMER_SECRET?.trim();
  const oauth2ClientId = process.env.TUMBLR_OAUTH2_CLIENT_ID?.trim();
  const oauth2ClientSecret = process.env.TUMBLR_OAUTH2_CLIENT_SECRET?.trim();

  return {
    consumerKey: maskSecret(consumerKey),
    consumerSecret: maskSecret(consumerSecret),
    callbackUrl: process.env.TUMBLR_CALLBACK_URL?.trim() ?? null,
    userAgent: process.env.TUMBLR_USER_AGENT?.trim() ?? null,
    oauth2ClientId: maskSecret(oauth2ClientId),
    oauth2ClientSecret: maskSecret(oauth2ClientSecret),
    oauth2ClientIdMatchesConsumerKey: Boolean(consumerKey && oauth2ClientId && consumerKey === oauth2ClientId),
    oauth2ClientSecretMatchesConsumerSecret: Boolean(
      consumerSecret && oauth2ClientSecret && consumerSecret === oauth2ClientSecret
    )
  };
}

export function formatTumblrOAuthEnvForError() {
  const summary = getTumblrOAuthEnvSummary();
  return `consumerKey=${JSON.stringify(summary.consumerKey)}, callbackUrl=${summary.callbackUrl}, userAgent=${summary.userAgent}`;
}
