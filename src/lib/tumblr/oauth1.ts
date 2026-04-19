import crypto from "node:crypto";
import OAuth from "oauth-1.0a";
import { formatTumblrOAuthEnvForError, getTumblrOAuthEnv } from "@/lib/tumblr/env";

export type RequestTokenResult = {
  oauthToken: string;
  oauthTokenSecret: string;
  callbackConfirmed: boolean;
};

export type AccessTokenResult = {
  oauthToken: string;
  oauthTokenSecret: string;
};

export type TumblrCredentialPreflight = {
  ok: boolean;
  status: number;
  body: string;
};

export class TumblrCredentialError extends Error {
  constructor(
    message: string,
    readonly preflight?: TumblrCredentialPreflight
  ) {
    super(message);
    this.name = "TumblrCredentialError";
  }
}

function createOAuth() {
  const env = getTumblrOAuthEnv();
  return new OAuth({
    consumer: {
      key: env.TUMBLR_CONSUMER_KEY,
      secret: env.TUMBLR_CONSUMER_SECRET
    },
    signature_method: "HMAC-SHA1",
    hash_function(baseString, key) {
      return crypto.createHmac("sha1", key).update(baseString).digest("base64");
    }
  });
}

function parseFormEncoded(body: string) {
  return Object.fromEntries(new URLSearchParams(body));
}

export async function preflightConsumerKey(): Promise<TumblrCredentialPreflight> {
  const env = getTumblrOAuthEnv();
  const url = new URL("https://api.tumblr.com/v2/tagged");
  url.searchParams.set("tag", "tumblr");
  url.searchParams.set("limit", "1");
  url.searchParams.set("api_key", env.TUMBLR_CONSUMER_KEY);

  const response = await fetch(url, {
    headers: {
      "User-Agent": env.TUMBLR_USER_AGENT,
      Accept: "application/json"
    }
  });

  const body = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    body: body.slice(0, 600)
  };
}

async function signedTumblrRequest(
  url: string,
  method: "GET" | "POST",
  oauthParams: Record<string, string> = {},
  token?: { key: string; secret: string }
) {
  const env = getTumblrOAuthEnv();
  const oauth = createOAuth();
  const oauthData = oauth.authorize({ url, method, data: oauthParams }, token);
  const headers = oauth.toHeader({ ...oauthData, ...oauthParams });

  console.info("[tumblr-oauth] signed request", {
    url,
    method,
    env: formatTumblrOAuthEnvForError(),
    oauthParamKeys: Object.keys(oauthParams),
    hasToken: Boolean(token?.key)
  });

  const response = await fetch(url, {
    method,
    headers: {
      ...headers,
      "User-Agent": env.TUMBLR_USER_AGENT,
      Accept: "application/x-www-form-urlencoded"
    }
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("[tumblr-oauth] request failed", {
      url,
      method,
      status: response.status,
      response: text,
      env: formatTumblrOAuthEnvForError()
    });
    throw new Error(
      `Tumblr OAuth request failed with ${response.status}: ${text}. Runtime env: ${formatTumblrOAuthEnvForError()}`
    );
  }
  return parseFormEncoded(text);
}

export async function getRequestToken(): Promise<RequestTokenResult> {
  const env = getTumblrOAuthEnv();

  const preflight = await preflightConsumerKey();
  console.info("[tumblr-oauth] consumer key preflight", {
    ok: preflight.ok,
    status: preflight.status,
    env: formatTumblrOAuthEnvForError()
  });
  if (!preflight.ok) {
    console.error("[tumblr-oauth] consumer key preflight failed", {
      status: preflight.status,
      response: preflight.body,
      env: formatTumblrOAuthEnvForError()
    });
    throw new TumblrCredentialError(
      `Tumblr does not recognize the configured OAuth Consumer Key. The key was read from the backend env, but Tumblr rejected it before OAuth started. Use Tumblr's OAuth Consumer Key from an active registered application, or register a fresh application and replace TUMBLR_CONSUMER_KEY/TUMBLR_CONSUMER_SECRET. Status ${preflight.status}: ${preflight.body}. Runtime env: ${formatTumblrOAuthEnvForError()}`,
      preflight
    );
  }

  const values = await signedTumblrRequest("https://www.tumblr.com/oauth/request_token", "POST", {
    oauth_callback: env.TUMBLR_CALLBACK_URL
  });

  if (!values.oauth_token || !values.oauth_token_secret) {
    throw new Error("Tumblr did not return an OAuth request token.");
  }

  return {
    oauthToken: values.oauth_token,
    oauthTokenSecret: values.oauth_token_secret,
    callbackConfirmed: values.oauth_callback_confirmed === "true"
  };
}

export function buildAuthorizeUrl(oauthToken: string) {
  const url = new URL("https://www.tumblr.com/oauth/authorize");
  url.searchParams.set("oauth_token", oauthToken);
  url.searchParams.set("source", "tumblr-studio");
  return url;
}

export async function exchangeAccessToken(input: {
  oauthToken: string;
  oauthTokenSecret: string;
  oauthVerifier: string;
}): Promise<AccessTokenResult> {
  const values = await signedTumblrRequest(
    "https://www.tumblr.com/oauth/access_token",
    "GET",
    { oauth_verifier: input.oauthVerifier },
    { key: input.oauthToken, secret: input.oauthTokenSecret }
  );

  if (!values.oauth_token || !values.oauth_token_secret) {
    throw new Error("Tumblr did not return an OAuth access token.");
  }

  return {
    oauthToken: values.oauth_token,
    oauthTokenSecret: values.oauth_token_secret
  };
}
