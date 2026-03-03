"use client";

import React from "react";
import Icon from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[--interactive-primary-bg] text-[--interactive-primary-text] hover:bg-[--interactive-primary-bg-hover]",
  secondary:
    "bg-[--interactive-secondary-bg] text-[--interactive-secondary-text] hover:bg-[--interactive-secondary-bg-hover] border border-[--border-default]",
  ghost:
    "bg-[--interactive-ghost-bg] text-[--interactive-ghost-text] hover:bg-[--interactive-ghost-bg-hover]",
  destructive:
    "bg-[--interactive-destructive-bg] text-[--interactive-destructive-text] hover:bg-[--interactive-destructive-bg-hover]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs h-7 rounded-[--radius-sm]",
  md: "px-4 py-2 text-sm h-9 rounded-[--radius-md]",
  lg: "px-5 py-2.5 text-base h-11 rounded-[--radius-lg]",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors duration-150 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-primary-500] disabled:pointer-events-none disabled:opacity-50";

export function getButtonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  fullWidth?: boolean,
  extra?: string
): string {
  return [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  const classes = getButtonClasses(variant, size, fullWidth, className);

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      aria-disabled={isLoading || undefined}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <Icon
          aria-label="Loading"
          size={size === "sm" ? 12 : size === "lg" ? 18 : 14}
          className="animate-spin"
          name="close"
        />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
