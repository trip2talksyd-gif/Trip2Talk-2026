"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginForm() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      setError("Invalid PIN");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a1628] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <h1 className="font-serif text-2xl text-white">Trip2Talk Admin</h1>
        <p className="mt-2 text-sm text-white/60">Enter your PIN</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          className="mt-6 w-full rounded-lg bg-black/40 px-4 py-3 text-center text-lg tracking-widest text-white"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        {error && <p className="mt-3 text-center text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-white py-3 text-sm font-medium text-black"
        >
          Sign in
        </button>
      </form>
    </main>
  );
}
