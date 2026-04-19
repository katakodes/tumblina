import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[82vh] max-w-3xl items-center px-5">
      <section className="w-full rounded-md border border-ink/10 bg-white/78 p-8 shadow-editorial">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Tumblr connection</p>
        <h1 className="mt-3 font-serif text-5xl">Connect your account</h1>
        <p className="mt-4 max-w-2xl leading-7 text-ink/68">
          Tumblr Studio uses official Tumblr API credentials. Private workflows require authenticated access for likes,
          posts, drafts, queue, and publishing.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/api/auth/tumblr/start" className="rounded-md bg-ink px-5 py-3 text-center text-sm font-medium text-paper">
            Start Tumblr auth
          </Link>
          <Link href="/onboarding" className="rounded-md border border-ink/12 px-5 py-3 text-center text-sm font-medium">
            Continue setup
          </Link>
        </div>
      </section>
    </main>
  );
}
