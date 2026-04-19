"use client";

import { ExternalLink, Pencil, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { getTumblrDisplayImageUrl } from "@/lib/media/display-url";

export type DraftCardData = {
  id: string;
  blogName: string;
  editUrl: string;
  imageUrl?: string;
  title?: string;
  text: string;
  type: string;
  tags: string[];
  date?: string;
};

type DraftActionState = {
  status: "idle" | "working" | "done" | "error";
  message: string;
};

export function DraftsGrid({ drafts }: { drafts: DraftCardData[] }) {
  const [visibleDrafts, setVisibleDrafts] = useState(drafts);
  const [actions, setActions] = useState<Record<string, DraftActionState>>({});

  async function runAction(draft: DraftCardData, action: "publish" | "delete") {
    const confirmMessage =
      action === "delete"
        ? "Delete this Tumblr draft? This cannot be undone."
        : "Publish this Tumblr draft now?";

    if (!window.confirm(confirmMessage)) return;

    setActions((current) => ({
      ...current,
      [draft.id]: { status: "working", message: action === "publish" ? "Publishing..." : "Deleting..." }
    }));

    const response = await fetch("/api/drafts/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        blogName: draft.blogName,
        postId: draft.id
      })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setActions((current) => ({
        ...current,
        [draft.id]: {
          status: "error",
          message: payload.error ?? "Tumblr could not update this draft."
        }
      }));
      return;
    }

    setActions((current) => ({
      ...current,
      [draft.id]: {
        status: "done",
        message: action === "publish" ? "Published." : "Deleted."
      }
    }));

    window.setTimeout(() => {
      setVisibleDrafts((current) => current.filter((item) => item.id !== draft.id));
    }, 350);
  }

  if (!visibleDrafts.length) {
    return (
      <div className="rounded-md border border-ink/10 bg-white/72 p-10">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Drafts</p>
        <h2 className="mt-2 font-serif text-3xl">No drafts yet</h2>
        <p className="mt-3 max-w-xl leading-7 text-ink/64">
          Unpublished Tumblr posts will appear here once the connected blog has saved drafts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {visibleDrafts.map((draft) => {
        const actionState = actions[draft.id] ?? { status: "idle", message: "" };
        const isWorking = actionState.status === "working";
        const imageUrl = draft.imageUrl ? getTumblrDisplayImageUrl(draft.imageUrl, "s400x600") : undefined;

        return (
          <article key={draft.id} className="flex h-[560px] flex-col overflow-hidden rounded-md border border-ink/10 bg-white/80 shadow-sm">
            <div className="relative h-[300px] shrink-0 bg-bone">
              {imageUrl ? (
                <img src={imageUrl} alt="" loading="eager" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col justify-center gap-4 p-7">
                  {draft.title ? <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/42">{draft.title}</p> : null}
                  <p className="line-clamp-8 font-serif text-2xl leading-snug text-ink/82">{draft.text}</p>
                </div>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm font-semibold">@{draft.blogName}</p>
                <span className="rounded-md bg-bone px-2 py-1 text-xs text-ink/62">{draft.type}</span>
              </div>
              <div className="flex min-h-[28px] flex-wrap gap-1.5 overflow-hidden">
                {draft.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-md bg-ink/5 px-2 py-1 text-xs text-ink/62">
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="mt-auto space-y-2">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={draft.editUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-3 py-2 text-xs font-medium text-ink/72 transition hover:bg-ink/5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit draft
                  </a>
                  <button
                    type="button"
                    onClick={() => runAction(draft, "publish")}
                    disabled={isWorking}
                    className="inline-flex items-center gap-1 rounded-md bg-ink px-3 py-2 text-xs font-medium text-paper transition hover:bg-ink/88 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => runAction(draft, "delete")}
                    disabled={isWorking}
                    className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-3 py-2 text-xs font-medium text-ink/60 transition hover:bg-ink/5 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
                <a href={draft.editUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-ocean">
                  Open in Tumblr <ExternalLink className="h-3 w-3" />
                </a>
                {actionState.message ? (
                  <p className={`text-xs ${actionState.status === "error" ? "text-tomato" : "text-ink/50"}`}>{actionState.message}</p>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
