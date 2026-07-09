import { CtaSection } from "@/components/cta/CtaSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-stone-900">
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-800">
          Trip2Talk
        </p>
        <h1
          className="mb-4 text-4xl font-normal tracking-tight sm:text-5xl"
          style={{ fontFamily: "var(--font-instrument-serif), serif" }}
        >
          Photo trips across Australia
        </h1>
        <p className="mx-auto max-w-xl text-lg text-stone-600">
          Small groups, expert Trip Leaders, and professional photographers —
          every highlight, every golden hour.
        </p>
      </section>

      <CtaSection />
    </main>
  );
}
