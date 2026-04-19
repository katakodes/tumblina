"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function OnboardingSyncPanel({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function syncLikes() {
    setStatus("syncing");
    setMessage("Pulling your latest Tumblr likes into the local library...");
    const response = await fetch("/api/sync/likes", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload.nextStep ?? payload.error ?? "Could not sync likes.");
      return;
    }
    setStatus("done");
    setMessage(`Imported ${payload.imported} likes. Opening your likes library now.`);
    router.refresh();
    setTimeout(() => router.push("/likes"), 650);
  }

  if (!connected) {
    return (
      <div className="mt-8 rounded-md border border-ink/10 bg-white/76 p-6">
        <h2 className="font-serif text-3xl">Connect Tumblr first</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/64">
          Once Tumblr authorizes the app, this screen will let you sync likes and posts.
        </p>
        <Link href="/login" className="mt-5 inline-flex rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper">
          Connect Tumblr
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-md border border-ink/10 bg-white/76 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-moss">Connected</p>
          <h2 className="mt-2 font-serif text-3xl">Start the first sync</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/64">
            Likes are the first useful library. The sync imports posts, stores tags/captions/blog names, and analyzes
            image colors when possible.
          </p>
        </div>
        <button
          onClick={syncLikes}
          disabled={status === "syncing"}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper transition hover:bg-ink/88 disabled:opacity-50"
        >
          {status === "syncing" ? "Syncing..." : "Sync Tumblr likes"}
        </button>
      </div>
      {message ? (
        <p className={`mt-4 text-sm ${status === "error" ? "text-tomato" : "text-ink/62"}`}>{message}</p>
      ) : null}
    </div>
  );
}
