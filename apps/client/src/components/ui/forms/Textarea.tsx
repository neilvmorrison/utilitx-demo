"use client";

import React, { useId, useRef, useEffect } from "react";
import { InputSize } from "./Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  inputSize?: InputSize;
  autoResize?: boolean;
  maxRows?: number;
}

const textareaSizeClasses: Record<InputSize, string> = {
  sm: "py-1 px-2 text-xs rounded-[--radius-sm]",
  md: "py-2 px-3 text-sm rounded-[--radius-md]",
  lg: "py-3 px-4 text-base rounded-[--radius-lg]",
};

const baseTextareaClasses =
  "w-full border bg-[--input-bg] text-[--input-text] border-[--input-border] placeholder:text-[--input-placeholder] transition-colors duration-150 focus:outline-none focus:border-[--input-border-focus] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--input-border-focus)_20%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[80px]";

const errorTextareaClasses =
  "border-[--input-border-error] focus:border-[--input-border-error] focus:ring-[color-mix(in_srgb,var(--input-border-error)_20%,transparent)]";

export default function Textarea({
  label,
  helperText,
  error,
  inputSize = "md",
  autoResize = false,
  maxRows,
  id: idProp,
  className,
  disabled,
  onChange,
  ...rest
}: TextareaProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const helperContent = error ?? helperText;
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoResize || !ref.current) return;
    const el = ref.current;
    el.style.height = "auto";
    const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10) || 20;
    const maxHeight = maxRows ? maxRows * lineHeight : Infinity;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [autoResize, maxRows]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (autoResize && ref.current) {
      const el = ref.current;
      el.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10) || 20;
      const maxHeight = maxRows ? maxRows * lineHeight : Infinity;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }
    onChange?.(e);
  }

  const classes = [
    baseTextareaClasses,
    textareaSizeClasses[inputSize],
    hasError ? errorTextareaClasses : "",
    autoResize ? "resize-none" : "resize-y",
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

      <textarea
        ref={ref}
        id={id}
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={helperContent ? helperId : undefined}
        className={classes}
        onChange={handleChange}
        {...rest}
      />

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
