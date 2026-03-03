"use client";

import React from "react";
import { ButtonVariant, ButtonSize, getButtonClasses } from "./Button";
import Icon from "./Icon";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon: React.ReactNode;
  "aria-label": string;
}

const squareSizeClasses: Record<ButtonSize, string> = {
  sm: "w-7 h-7 p-0 rounded-[--radius-sm]",
  md: "w-9 h-9 p-0 rounded-[--radius-md]",
  lg: "w-11 h-11 p-0 rounded-[--radius-lg]",
};

export default function IconButton({
  variant = "ghost",
  size = "md",
  isLoading = false,
  icon,
  className,
  disabled,
  ...rest
}: IconButtonProps) {
  // Build classes: use Button's variant/base classes but override sizing to square
  const variantBase = getButtonClasses(variant, size, false).replace(
    /px-\S+\s?|py-\S+\s?|h-\S+\s?/g,
    "",
  );

  const classes = [variantBase, squareSizeClasses[size], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading || undefined}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {isLoading ? (
        <Icon
          aria-label="Loading"
          size={size === "sm" ? 12 : size === "lg" ? 18 : 14}
          className="animate-spin"
          icon="close"
        />
      ) : (
        icon
      )}
    </button>
  );
}
