import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentTumblrAccount } from "@/lib/session";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tumblina",
  description: "A polished companion layer for Tumblr discovery, curation, archives, previews, and web capture."
};

const nav = [
  ["Explore", "/explore"],
  ["Likes", "/likes"],
  ["My Archives", "/archive"],
  ["My Drafts", "/drafts"],
  ["Collections", "/collections"],
  ["Capture", "/capture/inbox"],
  ["Post", "/post/new"],
  ["Settings", "/settings"]
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const account = await getCurrentTumblrAccount();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-[#fbfaf7]">
          <header className="sticky top-0 z-40 border-b border-[#e9e5dd] bg-[#fbfaf7]/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center gap-5 px-5 py-3">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/tumblina_icon_512.png" alt="" width={44} height={44} className="rounded-md" />
                <span className="font-serif text-2xl tracking-normal">Tumblina</span>
              </Link>
              <nav className="hidden flex-1 items-center gap-1 lg:flex">
                {nav.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-md px-3 py-2 text-sm text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                  >
                    {label}
                  </Link>
                ))}
              </nav>
              <Link
                href={account ? "/settings" : "/login"}
                className={`rounded-md px-4 py-2 text-sm ${
                  account ? "border border-[#dad7d0] bg-[#eeeeea] text-ink/74" : "bg-ink text-paper"
                }`}
              >
                {account ? `@${account.name}` : "Connect Tumblr"}
              </Link>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
