"use client";

import { useState } from "react";

// TODO(Saen): Replace with real Trip2Talk trip footage — Milky Way / Aurora / landscape b-roll.
const VIDEO_SRC = "/video/hero-placeholder.mp4";

const NAV_ITEMS = ["หน้าแรก", "ทริปทั้งหมด", "แกลเลอรี่", "รีวิว", "ติดต่อเรา"];

export function Trip2TalkHeroPreview() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl"
      style={{ backgroundColor: "hsl(220 55% 8%)" }}
    >
      {!videoFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}

      <div className="relative z-10 flex h-full flex-col">
        <nav className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4">
          <span
            className="text-sm tracking-tight text-white sm:text-base md:text-lg"
            style={{ fontFamily: "var(--font-instrument-serif), serif" }}
          >
            Trip2Talk
          </span>

          <ul className="hidden items-center gap-3 md:flex lg:gap-4">
            {NAV_ITEMS.map((item, index) => (
              <li
                key={item}
                className={`text-[9px] lg:text-[10px] ${
                  index === 0 ? "text-white" : "text-white/60 hover:text-white"
                }`}
              >
                {item}
              </li>
            ))}
          </ul>

          <span className="liquid-glass rounded-full px-2.5 py-1 text-[9px] text-white sm:px-3 sm:text-[10px]">
            จองทริป
          </span>
        </nav>

        <div className="flex flex-1 flex-col items-center px-3 pb-6 pt-3 text-center sm:px-4 sm:pt-5 md:pt-7">
          <h1
            className="animate-fade-rise max-w-[90%] text-lg font-normal leading-[0.95] tracking-[-0.03em] text-white sm:text-2xl md:text-3xl lg:text-4xl"
            style={{ fontFamily: "var(--font-instrument-serif), serif" }}
          >
            ทุก<em className="not-italic text-white/55">แสง</em> ทุก
            <em className="not-italic text-white/55">เรื่องราว</em> เก็บไว้ให้คุณ
          </h1>

          <p className="animate-fade-rise-delay mt-2 max-w-[80%] text-[9px] leading-relaxed text-white/60 sm:mt-3 sm:max-w-sm sm:text-[11px] md:mt-4 md:max-w-md md:text-xs">
            คนขับ Trip Leader และช่างภาพมืออาชีพ ครบในทีมเดียว
            พาไปเก็บมุมที่ใช่ ในเวลาที่แสงสวยที่สุด
          </p>

          <button
            type="button"
            className="animate-fade-rise-delay-2 liquid-glass mt-3 rounded-full px-4 py-1.5 text-[9px] text-white sm:mt-4 sm:px-5 sm:py-2 sm:text-[10px] md:mt-5 md:px-6 md:py-2.5"
          >
            เริ่มต้นทริป
          </button>
        </div>
      </div>
    </div>
  );
}
