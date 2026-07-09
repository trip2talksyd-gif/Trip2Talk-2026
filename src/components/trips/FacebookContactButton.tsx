import { COMPANY } from "@/config/company";
import { cn } from "@/lib/cn";

interface FacebookContactButtonProps {
  className?: string;
}

export function FacebookContactButton({ className }: FacebookContactButtonProps) {
  return (
    <a
      href={COMPANY.facebook}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/5 px-9 text-sm font-medium text-white transition-colors hover:border-white/60 hover:bg-white/10",
        className,
      )}
    >
      แชทสอบถามทาง Facebook
    </a>
  );
}
