import React from "react";

export type BuiltinIconName =
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "upload"
  | "check"
  | "warning"
  | "info"
  | "external-link"
  | "file"
  | "minus"
  | "plus";

export interface IconProps {
  name?: BuiltinIconName;
  children?: React.ReactNode;
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

const ICON_PATHS: Record<BuiltinIconName, React.ReactNode> = {
  "chevron-up": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  ),
  "chevron-down": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  ),
  "chevron-left": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  ),
  "chevron-right": (
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  ),
  close: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  ),
  upload: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  ),
  check: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  ),
  warning: (
    <>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
    </>
  ),
  "external-link": (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
    />
  ),
  file: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  ),
  minus: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  ),
  plus: (
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  ),
};

export default function Icon({
  name,
  children,
  size = "md",
  color,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const px = typeof size === "number" ? size : SIZE_MAP[size];
  const isDecorative = !ariaLabel;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={px}
      height={px}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={isDecorative ? "true" : undefined}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      focusable="false"
      className={className}
    >
      {name ? ICON_PATHS[name] : children}
    </svg>
  );
}
