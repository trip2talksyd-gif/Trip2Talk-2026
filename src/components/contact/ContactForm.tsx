"use client";

import { useState } from "react";

import { MIcon } from "@/components/ui/MIcon";
import { COMPANY } from "@/config/company";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, message, website }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("error");
      setErrorMsg(data.error ?? "ส่งไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <p className="rounded-2xl border border-green-500/30 bg-green-900/20 p-6 text-green-200">
        ส่งข้อความแล้วครับ เราจะติดต่อกลับเร็วๆ นี้
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />
      <input
        required
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        placeholder="ชื่อ-นามสกุล"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        required
        type="email"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        placeholder="อีเมล"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        placeholder="เบอร์โทร (ไม่บังคับ)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <textarea
        required
        rows={5}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
        placeholder="ข้อความของคุณ"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      {status === "error" && <p className="text-sm text-red-400">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-white/90 py-3 text-sm font-medium text-black disabled:opacity-50"
      >
        {status === "loading" ? "กำลังส่ง..." : "ส่งข้อความ"}
      </button>
    </form>
  );
}

export function ContactInfoBlock() {
  return (
    <ul className="space-y-4 text-sm">
      <li>
        <a
          href={`mailto:${COMPANY.email}`}
          className="inline-flex items-center gap-3 text-white/85 hover:text-white"
        >
          <MIcon name="mail" size={22} />
          {COMPANY.email}
        </a>
      </li>
      <li>
        <a
          href={`tel:${COMPANY.phoneTel}`}
          className="inline-flex items-center gap-3 text-white/85 hover:text-white"
        >
          <MIcon name="call" size={22} />
          {COMPANY.phone}
        </a>
      </li>
      <li>
        <a
          href={COMPANY.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-white/85 hover:text-white"
        >
          <MIcon name="chat" size={22} />
          WhatsApp
        </a>
      </li>
      <li>
        <a
          href={COMPANY.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 text-white/85 hover:text-white"
        >
          <MIcon name="thumb_up" size={22} />
          Facebook
        </a>
      </li>
    </ul>
  );
}
