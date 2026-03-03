import React from "react";

export type SurfaceElevation = 1 | 2 | 3 | 4;
export type SurfaceRounded = "none" | "sm" | "md" | "lg" | "xl";
export type SurfacePadding = "none" | "sm" | "md" | "lg";

export interface SurfaceProps {
  as?: React.ElementType;
  elevation?: SurfaceElevation;
  rounded?: SurfaceRounded;
  padding?: SurfacePadding;
  shadow?: boolean;
  blur?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const elevationClasses: Record<SurfaceElevation, string> = {
  1: "bg-[--surface-1]",
  2: "bg-[--surface-2]",
  3: "bg-[--surface-3]",
  4: "bg-[--surface-4]",
};

const roundedClasses: Record<SurfaceRounded, string> = {
  none: "rounded-none",
  sm: "rounded-[--radius-sm]",
  md: "rounded-[--radius-md]",
  lg: "rounded-[--radius-lg]",
  xl: "rounded-[--radius-xl]",
};

const paddingClasses: Record<SurfacePadding, string> = {
  none: "p-0",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

export default function Surface({
  as: Tag = "div",
  elevation = 1,
  rounded = "md",
  padding = "none",
  shadow = false,
  blur = false,
  className,
  children,
}: SurfaceProps) {
  const classes = [
    elevationClasses[elevation],
    roundedClasses[rounded],
    paddingClasses[padding],
    shadow ? "shadow-[0_4px_24px_rgba(0,0,0,0.6)]" : "",
    blur ? "backdrop-blur-[10px]" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <Tag className={classes}>{children}</Tag>;
}
