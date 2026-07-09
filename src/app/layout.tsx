import type { Metadata } from "next";
import { Inter, Instrument_Serif, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import localFont from "next/font/local";

import { SITE_URL } from "@/config/company";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-sans-thai",
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-thai",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Trip2Talk | ทริปถ่ายภาพทั่วออสเตรเลีย",
    template: "%s | Trip2Talk",
  },
  description:
    "จองทริปถ่ายภาพกับ Trip2Talk — คนขับ Trip Leader และช่างภาพในทีมเดียว ทั่วออสเตรเลีย",
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: "Trip2Talk",
    title: "Trip2Talk | ทริปถ่ายภาพทั่วออสเตรเลีย",
    description:
      "จองทริปถ่ายภาพกับ Trip2Talk — คนขับ Trip Leader และช่างภาพในทีมเดียว",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${notoSansThai.variable} ${notoSerifThai.variable} ${geistSans.variable} font-sans antialiased`}
        style={{ fontFamily: "var(--font-inter), var(--font-noto-sans-thai), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
