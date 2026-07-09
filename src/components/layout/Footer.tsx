import Link from "next/link";

import { MIcon } from "@/components/ui/MIcon";
import { COMPANY } from "@/config/company";

const NAV = [
  { href: "/", label: "หน้าแรก" },
  { href: "/trips", label: "ทริปทั้งหมด" },
  { href: "/gallery", label: "แกลเลอรี่" },
  { href: "/reviews", label: "รีวิว" },
  { href: "/contact", label: "ติดต่อเรา" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p
              className="text-2xl tracking-tight"
              style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
            >
              Trip2Talk
            </p>
            <p className="mt-3 text-sm text-white/60">
              ทริปถ่ายภาพทั่วออสเตรเลีย — คนขับ Trip Leader และช่างภาพในทีมเดียว
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">เมนู</p>
            <ul className="mt-4 space-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/80 hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/50">ติดต่อ</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                >
                  <MIcon name="mail" size={18} />
                  {COMPANY.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${COMPANY.phoneTel}`}
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                >
                  <MIcon name="call" size={18} />
                  {COMPANY.phone}
                </a>
              </li>
              <li>
                <a
                  href={COMPANY.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                >
                  <MIcon name="chat" size={18} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={COMPANY.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white"
                >
                  <MIcon name="thumb_up" size={18} />
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Trip2Talk. All rights reserved. ABN {COMPANY.abn}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white/80">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms" className="hover:text-white/80">
              ข้อกำหนดการใช้บริการ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
