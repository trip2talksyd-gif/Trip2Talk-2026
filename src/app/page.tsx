export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-emerald-800">
          Trip2Talk V6
        </p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Photo trips across Australia
        </h1>
        <p className="max-w-xl text-lg text-stone-600">
          Firebase rebuild in progress. Trip catalog, booking, and admin
          dashboards arrive in the next phases.
        </p>
      </div>
    </main>
  );
}
