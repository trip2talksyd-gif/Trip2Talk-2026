import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm, ContactInfoBlock } from "@/components/contact/ContactForm";
import { COMPANY } from "@/config/company";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: `ติดต่อ Trip2Talk — อีเมล ${COMPANY.email} โทร ${COMPANY.phone}`,
  openGraph: {
    title: "ติดต่อเรา | Trip2Talk",
    description: "ส่งข้อความหรือติดต่อทีมงาน Trip2Talk",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1
          className="mt-4 font-serif text-4xl"
          style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
        >
          ติดต่อเรา
        </h1>
        <p className="mt-2 text-white/70">
          มีคำถามเรื่องทริป การจอง หรือทริปส่วนตัว — ส่งข้อความมาได้เลย
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div className="liquid-glass rounded-2xl p-6">
            <h2 className="text-lg font-medium">ช่องทางติดต่อ</h2>
            <div className="mt-6">
              <ContactInfoBlock />
            </div>
            <p className="mt-8 text-xs text-white/45">ABN {COMPANY.abn}</p>
          </div>
          <div className="liquid-glass rounded-2xl p-6">
            <h2 className="text-lg font-medium">ส่งข้อความ</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
