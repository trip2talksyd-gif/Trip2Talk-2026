"use client";

import Link from "next/link";
import { useState } from "react";

const ROUTES = [
  { n: 1, title: "สายหวาน & วินเทจ (Blue Mountains)" },
  { n: 2, title: "สายดอกไม้ & ทะเลทราย (Anna Bay)" },
  { n: 3, title: "สายธรรมชาติ Unseen (Oberon)" },
  { n: 4, title: "สายลุย & เหมืองเก่า (Anna Bay)" },
  { n: 5, title: "สายใบไม้เปลี่ยนสี (Seasonal)" },
  { n: 6, title: "สายสั่งลาซิดนีย์ (Kiama)" },
];

export default function PrivateTripPage() {
  const [route, setRoute] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        phone,
        email,
        preferredRoute: route,
        preferredDateRange: dateRange,
        notes,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "ส่งไม่สำเร็จ");
      return;
    }
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/trips" className="text-sm text-white/60 hover:text-white">
          ← ทริปทั้งหมด
        </Link>
        <h1 className="mt-4 font-serif text-3xl">ทริปส่วนตัว 1 วัน — 6 เส้นทาง</h1>
        <p className="mt-3 text-white/70">
          เลือกเส้นทางที่ชอบ แล้วส่งคำขอ — ทีมงานจะติดต่อกลับพร้อมใบเสนอราคา (ไม่มีการชำระเงินออนไลน์)
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {ROUTES.map((r) => (
            <button
              key={r.n}
              type="button"
              onClick={() => setRoute(r.n)}
              className={`rounded-xl border p-4 text-left text-sm ${
                route === r.n ? "border-white bg-white/10" : "border-white/10 bg-white/5"
              }`}
            >
              <span className="text-xs text-white/50">เส้นทาง {r.n}</span>
              <p className="mt-1 font-medium">{r.title}</p>
            </button>
          ))}
        </div>

        {sent ? (
          <p className="mt-10 rounded-xl bg-green-900/30 p-6 text-green-200">
            ส่งคำขอแล้ว — ทีมงานจะติดต่อกลับทางอีเมลหรือโทรศัพท์
          </p>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <input
              required
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm"
              placeholder="ชื่อ-นามสกุล"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              required
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm"
              placeholder="เบอร์โทร"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              required
              type="email"
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm"
              placeholder="ช่วงวันที่ที่สะดวก"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
            <textarea
              className="w-full rounded-lg bg-black/30 px-3 py-2 text-sm"
              placeholder="หมายเหตุเพิ่มเติม"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-full bg-white/90 py-3 text-sm font-medium text-black"
            >
              ส่งคำขอ
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
