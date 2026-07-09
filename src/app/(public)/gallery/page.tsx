import type { Metadata } from "next";
import Link from "next/link";

import { fetchActiveCatalog, tripImageUrl } from "@/lib/trips-server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "แกลเลอรี่",
  description: "แกลเลอรี่ภาพจากทริป Trip2Talk — ดูภาพและรายละเอียดทริปแต่ละเส้นทาง",
  openGraph: {
    title: "แกลเลอรี่ | Trip2Talk",
    description: "แกลเลอรี่ภาพจากทริป Trip2Talk",
  },
};

export default async function GalleryPage() {
  const catalog = await fetchActiveCatalog();

  return (
    <main className="min-h-screen bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          ← หน้าแรก
        </Link>
        <h1
          className="mt-4 font-serif text-4xl"
          style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
        >
          แกลเลอรี่
        </h1>
        <p className="mt-2 text-white/70">ภาพจากทริปของเรา — คลิกเพื่อดูรายละเอียดทริป</p>

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {catalog.map(({ template }) => {
            const hasPromo = Boolean(template.promoImageRef);
            const imageUrl = tripImageUrl(template.promoImageRef);
            const hasExternalGallery =
              template.galleryUrl &&
              template.galleryUrl.startsWith("http");

            return (
              <div
                key={template.tripCode}
                className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <Link href={`/trips/${template.tripCode}`} className="block">
                  {hasPromo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={template.nameTH}
                      className="w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-white/5 p-6 text-center text-sm text-white/50">
                      ภาพกำลังอัปเดต
                    </div>
                  )}
                  <div className="p-4">
                    <h2 className="font-serif text-lg">{template.nameTH}</h2>
                    {!hasPromo && (
                      <p className="mt-2 text-xs text-white/55">
                        แกลเลอรี่ทริปนี้กำลังอัปเดต —{" "}
                        <span className="underline">ดูรายละเอียดทริปได้ที่นี่</span>
                      </p>
                    )}
                  </div>
                </Link>
                {hasExternalGallery && (
                  <div className="border-t border-white/10 px-4 pb-4">
                    <a
                      href={template.galleryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/20"
                    >
                      ดูแกลเลอรี่เต็ม
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
