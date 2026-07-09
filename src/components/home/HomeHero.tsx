"use client";

import { useState } from "react";

import { PrimaryButton } from "@/components/ui/PrimaryButton";

const VIDEO_SRC = "/video/hero-placeholder.mp4";
const IMAGE_FALLBACK = "/images/cta-horizon-placeholder.png";

export function HomeHero() {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <section
      className="relative flex min-h-[90vh] flex-col justify-center overflow-hidden text-white"
      style={{ backgroundColor: "hsl(220 55% 8%)" }}
    >
      {!videoFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-60"
          onError={() => setVideoFailed(true)}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      {videoFailed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={IMAGE_FALLBACK}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[#0a1628]/40 via-[#0a1628]/60 to-[#0a1628]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h1
          className="text-balance text-4xl font-normal leading-tight tracking-tight sm:text-5xl md:text-6xl"
          style={{ fontFamily: "var(--font-instrument-serif), var(--font-noto-serif-thai), serif" }}
        >
          เก็บทุกโมเมนต์ ทุกทริป
          <br />
          ให้กลายเป็นภาพในตำนาน
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
          คนขับ Trip Leader และช่างภาพมืออาชีพ — ครบในทีมเดียว
          พาคุณไปเก็บมุมที่ใช่ ในเวลาที่แสงสวยที่สุด ทั่วออสเตรเลีย
        </p>
        <div className="mt-10 flex justify-center">
          <PrimaryButton href="/trips" text="ดูทริปทั้งหมด">
            ดูทริปทั้งหมด
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
