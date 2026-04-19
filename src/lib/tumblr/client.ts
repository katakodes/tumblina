import crypto from "node:crypto";
import OAuth from "oauth-1.0a";
import { z } from "zod";
import { getTumblrOAuthEnvSummary } from "@/lib/tumblr/env";
import type { CreatePostInput, TumblrApiResponse, TumblrBlog, TumblrPost } from "@/lib/tumblr/types";

const trimmedOptionalString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  return value.trim();
}, z.string().optional());

const envSchema = z.object({
  TUMBLR_CONSUMER_KEY: trimmedOptionalString,
  TUMBLR_CONSUMER_SECRET: trimmedOptionalString,
  TUMBLR_USER_AGENT: z
    .preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().optional())
    .default("Tumblr Studio/0.1")
});

export type TumblrCredentials = {
  accessToken?: string;
  refreshToken?: string;
  oauthToken?: string;
  oauthSecret?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  form?: Record<string, string | number | boolean | undefined>;
  auth?: "apiKey" | "oauth1" | "bearer";
};

export class TumblrClient {
  private readonly baseUrl = "https://api.tumblr.com/v2";
  private readonly env = envSchema.parse(process.env);

  constructor(private readonly credentials: TumblrCredentials = {}) {}

  async getUserInfo() {
    return this.request<{ user: { name: string; blogs: TumblrBlog[] } }>("/user/info", { auth: "oauth1" });
  }

  async getUserLikes(params: { before?: number; after?: number; offset?: number; limit?: number } = {}) {
    return this.request<{ liked_posts: TumblrPost[]; liked_count: number }>("/user/likes", {
      query: { limit: 20, ...params, npf: true },
      auth: "oauth1"
    });
  }

  async getTagged(tag: string, params: { before?: number; limit?: number } = {}) {
    return this.request<TumblrPost[]>("/tagged", {
      query: { api_key: this.env.TUMBLR_CONSUMER_KEY, tag, limit: 20, ...params, npf: true },
      auth: "apiKey"
    });
  }

  async getBlogPosts(blogName: string, params: { before?: number; after?: number; tag?: string; type?: string; limit?: number } = {}) {
    return this.request<{ blog: TumblrBlog; posts: TumblrPost[]; total_posts: number }>(`/blog/${blogName}/posts`, {
      query: { limit: 20, ...params, npf: true },
      auth: this.credentials.oauthToken ? "oauth1" : "apiKey"
    });
  }

  async getDrafts(blogName: string, beforeId?: string) {
    return this.request<{ posts: TumblrPost[] }>(`/blog/${blogName}/posts/draft`, {
      query: { before_id: beforeId, npf: true },
      auth: "oauth1"
    });
  }

  async getQueue(blogName: string, offset = 0) {
    return this.request<{ posts: TumblrPost[] }>(`/blog/${blogName}/posts/queue`, {
      query: { offset, npf: true },
      auth: "oauth1"
    });
  }

  async createNpfPost(input: CreatePostInput) {
    return this.request<TumblrPost>(`/blog/${input.blogName}/post`, {
      method: "POST",
      auth: "oauth1",
      body: {
        state: input.state,
        tags: input.tags?.join(","),
        source_url: input.sourceUrl,
        content: input.content,
        layout: input.layout ?? []
      }
    });
  }

  async reblogPost(input: {
    blogName: string;
    postId: string;
    reblogKey: string;
    comment?: string;
    tags?: string[];
    state?: "published" | "draft" | "queue" | "private";
  }) {
    return this.request<{ id: string; id_string?: string }>(`/blog/${input.blogName}/post/reblog`, {
      method: "POST",
      auth: "oauth1",
      form: {
        id: input.postId,
        reblog_key: input.reblogKey,
        comment: input.comment,
        tags: input.tags?.join(","),
        state: input.state
      }
    });
  }

  async unlikePost(input: { postId: string; reblogKey: string }) {
    return this.request<Record<string, never>>("/user/unlike", {
      method: "POST",
      auth: "oauth1",
      form: {
        id: input.postId,
        reblog_key: input.reblogKey
      }
    });
  }

  async publishDraft(input: { blogName: string; postId: string }) {
    return this.request<{ id?: string; id_string?: string }>(`/blog/${input.blogName}/post/edit`, {
      method: "POST",
      auth: "oauth1",
      form: {
        id: input.postId,
        state: "published"
      }
    });
  }

  async deletePost(input: { blogName: string; postId: string }) {
    return this.request<Record<string, never>>(`/blog/${input.blogName}/post/delete`, {
      method: "POST",
      auth: "oauth1",
      form: {
        id: input.postId
      }
    });
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const method = options.method ?? "GET";
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(options.query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const headers: Record<string, string> = {
      "User-Agent": this.env.TUMBLR_USER_AGENT,
      Accept: "application/json"
    };

    let body: string | undefined;
    const formData = Object.fromEntries(
      Object.entries(options.form ?? {}).filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
    );

    if (options.form !== undefined) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      body = new URLSearchParams(Object.entries(formData).map(([key, value]) => [key, String(value)])).toString();
    } else if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    if (options.auth === "bearer" && this.credentials.accessToken) {
      headers.Authorization = `Bearer ${this.credentials.accessToken}`;
    }

    if (options.auth === "oauth1") {
      Object.assign(headers, this.oauth1Header(url.toString(), method, formData));
    }

    const response = await fetch(url, { method, headers, body });
    const payload = (await response.json()) as TumblrApiResponse<T>;
    if (!response.ok || payload.meta?.status >= 400) {
      const detail = payload.errors?.map((error) => error.title ?? error.detail).filter(Boolean).join("; ");
      throw new Error(`Tumblr API ${payload.meta?.status ?? response.status}: ${detail || payload.meta?.msg || response.statusText}`);
    }
    return payload.response;
  }

  private oauth1Header(url: string, method: string, data: Record<string, string | number | boolean> = {}) {
    const consumerKey = this.env.TUMBLR_CONSUMER_KEY;
    const consumerSecret = this.env.TUMBLR_CONSUMER_SECRET;
    if (!consumerKey || !consumerSecret || !this.credentials.oauthToken || !this.credentials.oauthSecret) {
      throw new Error(
        `Tumblr OAuth 1.0a credentials are required for this endpoint. Runtime env: ${JSON.stringify(
          getTumblrOAuthEnvSummary()
        )}`
      );
    }
    const oauth = new OAuth({
      consumer: { key: consumerKey, secret: consumerSecret },
      signature_method: "HMAC-SHA1",
      hash_function(baseString, key) {
        return crypto.createHmac("sha1", key).update(baseString).digest("base64");
      }
    });
    return oauth.toHeader(
      oauth.authorize(
        { url, method, data },
        { key: this.credentials.oauthToken, secret: this.credentials.oauthSecret }
      )
    ) as unknown as Record<string, string>;
  }
}
