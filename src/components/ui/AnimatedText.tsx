"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export function AnimatedText({ text, className }: AnimatedTextProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <span
      className={cn("relative inline-block overflow-hidden", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="block transition-transform duration-300 ease-out"
        style={{ transform: hovered ? "translateY(-100%)" : "translateY(0)" }}
      >
        {text}
      </span>
      <span
        className="absolute inset-x-0 top-full block transition-transform duration-300 ease-out"
        style={{ transform: hovered ? "translateY(-100%)" : "translateY(0)" }}
        aria-hidden
      >
        {text}
      </span>
    </span>
  );
}
