import React from "react";

export type TextElement =
  | "p"
  | "span"
  | "label"
  | "small"
  | "strong"
  | "em"
  | "li"
  | "caption";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";
export type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "disabled"
  | "error"
  | "success"
  | "warning"
  | "info";

export interface TextProps {
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  color?: TextColor;
  truncate?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const sizeClasses: Record<TextSize, string> = {
  xs: "text-xs leading-4",
  sm: "text-sm leading-5",
  md: "text-base leading-6",
  lg: "text-lg leading-7",
  xl: "text-xl leading-8",
};

const weightClasses: Record<TextWeight, string> = {
  normal: "font-normal",
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

export default function Text<T extends TextElement = "p">({
  as,
  size = "md",
  weight = "normal",
  color = "primary",
  truncate = false,
  className,
  children,
  ...rest
}: TextProps & React.ComponentPropsWithoutRef<T>) {
  const Tag = (as ?? "p") as React.ElementType;

  const classes = [
    sizeClasses[size],
    weightClasses[weight],
    colorClasses[color],
    truncate ? "truncate" : "",
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
