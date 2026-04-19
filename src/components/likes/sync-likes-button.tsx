"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncLikesButton() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function syncLikes() {
    setStatus("syncing");
    setMessage("Syncing the next batch of Tumblr likes. This pulls up to 200 at a time...");
    const response = await fetch("/api/sync/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: 10, strategy: "before" })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setStatus("error");
      setMessage(payload.nextStep ?? payload.error ?? "Could not sync likes.");
      return;
    }

    setStatus("done");
    setMessage(
      `Imported or refreshed ${payload.imported} likes. Local library now has ${payload.localTotal}. Tumblr reports ${payload.total} total likes.`
    );
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={syncLikes}
        disabled={status === "syncing"}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/88 disabled:opacity-50"
      >
        {status === "syncing" ? "Syncing..." : "Sync Tumblr likes"}
      </button>
      {message ? (
        <p className={`max-w-md text-sm ${status === "error" ? "text-tomato" : "text-ink/58"}`}>{message}</p>
      ) : null}
    </div>
  );
}
