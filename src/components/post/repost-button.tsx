"use client";

import { Repeat2 } from "lucide-react";
import { useState } from "react";

export function RepostButton({ postId, disabled, onRemoved }: { postId: string; disabled?: boolean; onRemoved?: () => void }) {
  const [status, setStatus] = useState<"idle" | "posting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function repost() {
    setStatus("posting");
    setMessage("");

    const response = await fetch("/api/posts/reblog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, state: "published" })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Could not repost.");
      return;
    }

    setStatus("done");
    if (payload.removedFromLikes) {
      setMessage(`Reposted to @${payload.destinationBlog} and removed from likes.`);
      window.setTimeout(() => onRemoved?.(), 450);
    } else {
      setMessage(`Reposted to @${payload.destinationBlog}. Unlike failed; it may still appear in likes.`);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={repost}
        disabled={disabled || status === "posting" || status === "done"}
        className="inline-flex items-center gap-1 rounded-md border border-ink/10 px-3 py-2 text-xs font-medium text-ink/72 transition hover:bg-ink/5 disabled:opacity-50"
      >
        <Repeat2 className="h-3.5 w-3.5" />
        {status === "posting" ? "Reposting..." : status === "done" ? "Reposted" : "Repost"}
      </button>
      {message ? <p className={`text-xs ${status === "error" ? "text-tomato" : "text-ink/50"}`}>{message}</p> : null}
    </div>
  );
}
