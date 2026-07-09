"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { FadeUp } from "@/components/motion/FadeUp";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useIsMobile } from "@/hooks/useIsMobile";

import { CtaDashboardMock } from "./CtaDashboardMock";

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const dashboardY = useTransform(scrollYProgress, [0, 1], ["120px", "-120px"]);
  const horizonY = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? ["80px", "-40px"] : ["200px", "-200px"],
  );

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative w-full text-white"
      style={{
        background: "linear-gradient(to bottom, transparent 0%, #14191E 100%)",
      }}
    >
      <div className="relative mx-auto max-w-[1080px] px-4 pb-[440px] pt-24 sm:px-6 sm:pb-[520px] sm:pt-32 md:pb-[440px] md:pt-40">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="relative z-20 max-w-[400px]">
            <FadeUp delay={1}>
              <h2
                className="text-3xl font-normal leading-[1.05] tracking-[-0.02em] text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-instrument-serif), serif" }}
              >
                อย่าปล่อยให้ทริปหน้าผ่านไป โดยไม่มีรูปสวยติดมือกลับบ้าน
              </h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="mt-6 max-w-[380px] text-base leading-[1.5] text-landing-text sm:text-lg">
                Trip2Talk พาไปพร้อมคนขับ Trip Leader และช่างภาพมืออาชีพในทีมเดียว
                ครบทุกจุดไฮไลท์ ไม่ต้องหาที่ยืนเอง ไม่ต้องกังวลเรื่องมุมกล้อง
                แค่เดินไปกับเรา ที่เหลือให้กล้องจัดการ
              </p>
            </FadeUp>
            <FadeUp delay={0.2} className="mt-10">
              <PrimaryButton as="a" href="/trips">
                ดูทริปทั้งหมด
              </PrimaryButton>
            </FadeUp>
          </div>
        </div>
      </div>

      <motion.div
        style={{ y: dashboardY }}
        className="absolute left-4 right-4 top-[440px] z-10 sm:left-auto sm:-right-[8%] sm:top-[460px] sm:w-[85%] md:-right-[10%] md:top-[500px] md:w-[80%] lg:top-20 lg:-right-[12%] lg:w-[68%]"
      >
        <CtaDashboardMock />
      </motion.div>

      {/* TODO(Saen): Replace with a real Trip2Talk landscape photo — e.g. Uluru at dusk or a Tasmania coastline silhouette — once Saen provides one. */}
      <motion.img
        src="/images/cta-horizon-placeholder.png"
        alt=""
        aria-hidden
        style={{ y: horizonY }}
        className="pointer-events-none absolute bottom-[-40px] left-0 right-0 z-30 w-full select-none object-cover sm:bottom-[-80px] lg:bottom-[-140px]"
      />
    </section>
  );
}
