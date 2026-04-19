export type TumblrPostType =
  | "text"
  | "photo"
  | "quote"
  | "link"
  | "chat"
  | "audio"
  | "video"
  | "answer"
  | "blocks";

export type TumblrPost = {
  id: number | string;
  id_string?: string;
  blog_name: string;
  post_url?: string;
  short_url?: string;
  type?: TumblrPostType;
  state?: string;
  timestamp?: number;
  liked_timestamp?: number;
  date?: string;
  tags?: string[];
  summary?: string;
  caption?: string;
  body?: string;
  title?: string;
  source_url?: string;
  source_title?: string;
  reblog_key?: string;
  photos?: Array<{
    caption?: string;
    original_size?: { url: string; width?: number; height?: number };
    alt_sizes?: Array<{ url: string; width?: number; height?: number }>;
  }>;
  content?: Array<Record<string, unknown>>;
  layout?: Array<Record<string, unknown>>;
  trail?: Array<{ content?: Array<Record<string, unknown>>; [key: string]: unknown }>;
  [key: string]: unknown;
};

export type TumblrBlog = {
  uuid?: string;
  name: string;
  title?: string;
  url?: string;
  primary?: boolean;
  can_post?: boolean;
  avatar?: Array<{ width: number; height: number; url: string }>;
  [key: string]: unknown;
};

export type TumblrApiResponse<T> = {
  meta: { status: number; msg: string };
  response: T;
  errors?: Array<{ title?: string; code?: number; detail?: string }>;
};

export type CreatePostInput = {
  blogName: string;
  state: "published" | "draft" | "queue" | "private";
  tags?: string[];
  sourceUrl?: string;
  content: Array<Record<string, unknown>>;
  layout?: Array<Record<string, unknown>>;
};
