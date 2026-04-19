import { OnboardingSyncPanel } from "@/components/onboarding/onboarding-sync-panel";
import { getCurrentTumblrAccount } from "@/lib/session";

const steps = ["Welcome", "Connect Tumblr", "Choose blogs", "Initial sync", "Finish"];

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const account = await getCurrentTumblrAccount();

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/42">Onboarding</p>
      <h1 className="mt-2 font-serif text-5xl">
        {account ? `Connected as @${account.name}.` : "Set the studio up once."}
      </h1>
      {account ? (
        <p className="mt-4 text-sm leading-6 text-ink/64">
          Blogs found: {account.blogs.map((blog) => blog.name).join(", ")}
        </p>
      ) : null}
      <div className="mt-8 grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => (
          <section key={step} className="rounded-md border border-ink/10 bg-white/72 p-4">
            <span className="text-sm text-ink/42">0{index + 1}</span>
            <h2 className="mt-6 font-serif text-2xl">{step}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/62">
              {index === 3
                ? "Choose likes, posts, drafts, and queue where the API allows access."
                : "Keep the setup focused, reversible, and easy to revisit."}
            </p>
          </section>
        ))}
      </div>
      <OnboardingSyncPanel connected={Boolean(account)} />
    </main>
  );
}
