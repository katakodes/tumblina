"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BROAD_COLOR_TAXONOMY } from "@/lib/color/taxonomy";

type SettingsPanelProps = {
  connectedAccount?: {
    name: string;
    blogs: Array<{ name: string; isPrimary: boolean; canPost: boolean }>;
  } | null;
  initialSettings: {
    defaultPublishAction: string;
    syncFrequencyMinutes: number;
    appearance: string;
  } | null;
  localCounts: {
    likes: number;
    posts: number;
    media: number;
  };
};

export function SettingsPanel({ connectedAccount, initialSettings, localCounts }: SettingsPanelProps) {
  const router = useRouter();
  const [defaultPublishAction, setDefaultPublishAction] = useState(initialSettings?.defaultPublishAction ?? "draft");
  const [syncFrequencyMinutes, setSyncFrequencyMinutes] = useState(initialSettings?.syncFrequencyMinutes ?? 360);
  const [appearance, setAppearance] = useState(initialSettings?.appearance ?? "system");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveSettings() {
    setSaving(true);
    setStatus("Saving settings...");
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultPublishAction, syncFrequencyMinutes, appearance })
    });
    const payload = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Could not save settings.");
      return;
    }

    setStatus("Settings saved.");
    router.refresh();
  }

  async function syncLikes() {
    setStatus("Syncing the next batch of likes...");
    const response = await fetch("/api/sync/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: 10, strategy: "before" })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus(payload.error ?? "Could not sync likes.");
      return;
    }
    setStatus(`Synced ${payload.imported} likes. Local library now has ${payload.localTotal}.`);
    router.refresh();
  }

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <section className="rounded-md border border-ink/10 bg-white/72 p-5">
        <h2 className="font-serif text-3xl">Connected account</h2>
        {connectedAccount ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-ink/64">
              Connected as <span className="font-semibold text-ink">@{connectedAccount.name}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {connectedAccount.blogs.map((blog) => (
                <span key={blog.name} className="rounded-md bg-ink/5 px-3 py-2 text-sm text-ink/68">
                  {blog.name}
                  {blog.isPrimary ? " · primary" : ""}
                  {blog.canPost ? " · can post" : ""}
                </span>
              ))}
            </div>
            <Link href="/login" className="inline-flex rounded-md border border-ink/10 px-4 py-2 text-sm">
              Reconnect Tumblr
            </Link>
          </div>
        ) : (
          <Link href="/login" className="mt-4 inline-flex rounded-md bg-ink px-4 py-2 text-sm text-paper">
            Connect Tumblr
          </Link>
        )}
      </section>

      <section className="rounded-md border border-ink/10 bg-white/72 p-5">
        <h2 className="font-serif text-3xl">Sync frequency</h2>
        <p className="mt-2 text-sm text-ink/58">
          {localCounts.likes} likes · {localCounts.posts} posts · {localCounts.media} media assets local
        </p>
        <label className="mt-5 block text-sm font-medium">
          Sync every
          <select
            value={syncFrequencyMinutes}
            onChange={(event) => setSyncFrequencyMinutes(Number(event.target.value))}
            className="mt-2 w-full rounded-md border border-ink/10 bg-paper px-3 py-2"
          >
            <option value={60}>1 hour</option>
            <option value={360}>6 hours</option>
            <option value={720}>12 hours</option>
            <option value={1440}>1 day</option>
            <option value={10080}>1 week</option>
          </select>
        </label>
        <button onClick={syncLikes} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm text-paper">
          Sync likes now
        </button>
      </section>

      <section className="rounded-md border border-ink/10 bg-white/72 p-5">
        <h2 className="font-serif text-3xl">Color taxonomy</h2>
        <p className="mt-2 text-sm leading-6 text-ink/62">Filters use broad palette families.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {BROAD_COLOR_TAXONOMY.map((color) => (
            <span key={color.name} className="inline-flex items-center gap-2 rounded-md border border-ink/10 px-3 py-2 text-sm">
              <span className="h-3.5 w-3.5 rounded-sm border border-ink/10" style={{ backgroundColor: color.hex }} />
              {color.label}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-ink/10 bg-white/72 p-5">
        <h2 className="font-serif text-3xl">Capture defaults</h2>
        <label className="mt-5 block text-sm font-medium">
          Default publish action
          <select
            value={defaultPublishAction}
            onChange={(event) => setDefaultPublishAction(event.target.value)}
            className="mt-2 w-full rounded-md border border-ink/10 bg-paper px-3 py-2"
          >
            <option value="draft">Save draft</option>
            <option value="queue">Queue</option>
            <option value="publish">Publish</option>
            <option value="save_only">Internal save only</option>
          </select>
        </label>
        <label className="mt-4 block text-sm font-medium">
          Appearance
          <select
            value={appearance}
            onChange={(event) => setAppearance(event.target.value)}
            className="mt-2 w-full rounded-md border border-ink/10 bg-paper px-3 py-2"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="editorial">Editorial</option>
          </select>
        </label>
        <button onClick={saveSettings} disabled={saving} className="mt-5 rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50">
          {saving ? "Saving..." : "Save settings"}
        </button>
        {status ? <p className="mt-3 text-sm text-ink/58">{status}</p> : null}
      </section>
    </div>
  );
}
