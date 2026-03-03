"use client";

import React, { useId } from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  error?: string;
  inputSize?: InputSize;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
}

const inputSizeClasses: Record<InputSize, string> = {
  sm: "py-1 px-2 text-xs rounded-[--radius-sm]",
  md: "py-2 px-3 text-sm rounded-[--radius-md]",
  lg: "py-3 px-4 text-base rounded-[--radius-lg]",
};

const baseInputClasses =
  "w-full border bg-[--input-bg] text-[--input-text] border-[--input-border] placeholder:text-[--input-placeholder] transition-colors duration-150 focus:outline-none focus:border-[--input-border-focus] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--input-border-focus)_20%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed";

const errorInputClasses =
  "border-[--input-border-error] focus:border-[--input-border-error] focus:ring-[color-mix(in_srgb,var(--input-border-error)_20%,transparent)]";

export default function Input({
  label,
  helperText,
  error,
  inputSize = "md",
  leftAdornment,
  rightAdornment,
  id: idProp,
  className,
  disabled,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const helperContent = error ?? helperText;

  const inputClasses = [
    baseInputClasses,
    inputSizeClasses[inputSize],
    hasError ? errorInputClasses : "",
    leftAdornment ? "pl-9" : "",
    rightAdornment ? "pr-9" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-[--input-label]"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftAdornment && (
          <span className="absolute left-2.5 flex items-center text-[--text-tertiary] pointer-events-none">
            {leftAdornment}
          </span>
        )}

        <input
          id={id}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={helperContent ? helperId : undefined}
          className={inputClasses}
          {...rest}
        />

        {rightAdornment && (
          <span className="absolute right-2.5 flex items-center text-[--text-tertiary]">
            {rightAdornment}
          </span>
        )}
      </div>

      {helperContent && (
        <span
          id={helperId}
          role={hasError ? "alert" : undefined}
          aria-live={hasError ? "polite" : undefined}
          className={`text-xs ${hasError ? "text-[--input-helper-error]" : "text-[--input-helper]"}`}
        >
          {helperContent}
        </span>
      )}
    </div>
  );
}
