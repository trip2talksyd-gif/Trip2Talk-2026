import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { AnimatedText } from "./AnimatedText";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-6 text-xs",
  md: "h-10 px-7 text-sm",
  lg: "h-12 px-9 text-sm font-medium",
};

interface PrimaryButtonBaseProps {
  children: ReactNode;
  size?: Size;
  className?: string;
  text?: string;
}

type PrimaryButtonProps =
  | (PrimaryButtonBaseProps & {
      as?: "button";
    } & ComponentPropsWithoutRef<"button">)
  | (PrimaryButtonBaseProps & {
      as: "a";
      href: string;
    } & Omit<ComponentPropsWithoutRef<"a">, "href">);

export function PrimaryButton({
  children,
  size = "lg",
  className,
  text,
  as = "a",
  ...props
}: PrimaryButtonProps) {
  const label = text ?? (typeof children === "string" ? children : "");
  const classes = cn(
    "inline-flex items-center justify-center rounded-full bg-white/80 text-black leading-none transition-colors hover:bg-white",
    sizeClasses[size],
    className,
  );

  const content = label ? <AnimatedText text={label} /> : children;

  if (as === "button") {
    const { ...buttonProps } = props as ComponentPropsWithoutRef<"button">;
    return (
      <button type="button" className={classes} {...buttonProps}>
        {content}
      </button>
    );
  }

  const { href, ...linkProps } = props as { href: string } & Omit<
    ComponentPropsWithoutRef<"a">,
    "href"
  >;

  return (
    <Link href={href} className={classes} {...linkProps}>
      {content}
    </Link>
  );
}
