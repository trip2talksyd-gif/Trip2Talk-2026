"use client";

import { useEffect, useState } from "react";

export function OwnerExtras() {
  const [departureId, setDepartureId] = useState("");
  const [settlement, setSettlement] = useState<Record<string, unknown> | null>(null);

  async function runSettlement() {
    const res = await fetch("/api/admin/settlement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ departureId }),
    });
    setSettlement(await res.json());
  }

  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="font-serif text-xl text-white">Financial export</h2>
        <a
          href="/api/admin/export/bookings-csv"
          className="mt-3 inline-block rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          Download bookings CSV
        </a>
      </section>

      <section>
        <h2 className="font-serif text-xl text-white">Settlement calculator</h2>
        <div className="mt-3 flex gap-2">
          <input
            className="rounded-lg bg-black/40 px-3 py-2 text-sm text-white"
            placeholder="Departure ID e.g. CAN-2D1N__2026-10-10"
            value={departureId}
            onChange={(e) => setDepartureId(e.target.value)}
          />
          <button
            type="button"
            onClick={runSettlement}
            className="rounded-full bg-white/90 px-4 py-2 text-sm text-black"
          >
            Calculate
          </button>
        </div>
        {settlement && (
          <pre className="mt-4 overflow-auto rounded-xl bg-black/40 p-4 text-xs text-white/80">
            {JSON.stringify(settlement, null, 2)}
          </pre>
        )}
      </section>

      <section>
        <h2 className="font-serif text-xl text-white">Company documents</h2>
        <p className="mt-2 text-sm text-white/60">
          Manage insurance, rego, driver authority via API — UI list loads from Supabase.
        </p>
        <CompanyDocsList />
      </section>

      <section>
        <h2 className="font-serif text-xl text-white">Booking inquiries</h2>
        <InquiriesList />
      </section>
    </div>
  );
}

function CompanyDocsList() {
  const [docs, setDocs] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/admin/company-documents")
      .then((r) => r.json())
      .then((d) => setDocs(d.documents ?? []));
  }, []);

  return (
    <ul className="mt-3 space-y-2 text-sm text-white/80">
      {docs.map((d) => (
        <li key={String(d.id)} className="rounded-lg bg-white/5 p-3">
          {String(d.documentLabel)} — expires {String(d.expiryDate)}
          {d.expiringSoon ? (
            <span className="ml-2 text-amber-400">⚠ expiring soon</span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function InquiriesList() {
  const [items, setItems] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    fetch("/api/admin/inquiries")
      .then((r) => r.json())
      .then((d) => setItems(d.inquiries ?? []));
  }, []);

  return (
    <ul className="mt-3 space-y-2 text-sm text-white/80">
      {items.map((i) => (
        <li key={String(i.id)} className="rounded-lg bg-white/5 p-3">
          {String(i.customerName)} — route {String(i.preferredRoute)} — {String(i.status)}
        </li>
      ))}
    </ul>
  );
}
