import React from "react";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

export interface IconProps {
  icon: string;
  size?: number | "sm" | "md" | "lg";
  color?: string;
  className?: string;
  "aria-label"?: string;
}

const SIZE_MAP: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

function toComponentName(name: string): string {
  return name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export default function Icon({
  icon,
  size = "md",
  color,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const componentName = toComponentName(icon);
  const LucideIcon = (
    LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>
  )[componentName];

  if (!LucideIcon) {
    console.warn(`Icon "${icon}" (${componentName}) not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      size={px}
      color={color ?? "currentColor"}
      className={className}
      aria-hidden={!ariaLabel ? "true" : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
    />
  );
}
