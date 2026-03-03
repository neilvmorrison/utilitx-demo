import React from "react";
import { TextColor } from "./Text";

export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type HeadingWeight = "medium" | "semibold" | "bold";

export interface HeadingProps {
  as?: HeadingTag;
  size?: HeadingSize;
  weight?: HeadingWeight;
  color?: TextColor;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses: Record<HeadingSize, string> = {
  xs: "text-xs leading-4",
  sm: "text-sm leading-5",
  md: "text-base leading-6",
  lg: "text-lg leading-7",
  xl: "text-xl leading-7",
  "2xl": "text-2xl leading-8",
  "3xl": "text-3xl leading-9",
};

const defaultSizeByTag: Record<HeadingTag, HeadingSize> = {
  h1: "3xl",
  h2: "2xl",
  h3: "xl",
  h4: "lg",
  h5: "md",
  h6: "sm",
};

const weightClasses: Record<HeadingWeight, string> = {
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorClasses: Record<TextColor, string> = {
  primary: "text-[--text-primary]",
  secondary: "text-[--text-secondary]",
  tertiary: "text-[--text-tertiary]",
  disabled: "text-[--text-disabled]",
  error: "text-[--feedback-error]",
  success: "text-[--feedback-success]",
  warning: "text-[--feedback-warning]",
  info: "text-[--feedback-info]",
};

export default function Heading<T extends HeadingTag = "h2">({
  as,
  size,
  weight = "semibold",
  color = "primary",
  className,
  children,
  ...rest
}: HeadingProps & React.ComponentPropsWithoutRef<T>) {
  const tag = (as ?? "h2") as HeadingTag;
  const Tag = tag as React.ElementType;
  const resolvedSize = size ?? defaultSizeByTag[tag];

  const classes = [
    sizeClasses[resolvedSize],
    weightClasses[weight],
    colorClasses[color],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
