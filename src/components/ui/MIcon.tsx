import { cn } from "@/lib/cn";

interface MIconProps {
  name: string;
  size?: number;
  fill?: 0 | 1;
  weight?: number;
  grade?: number;
  opticalSize?: number;
  className?: string;
}

export function MIcon({
  name,
  size = 24,
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  className,
}: MIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none", className)}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
      }}
      aria-hidden
    >
      {name}
    </span>
  );
}
