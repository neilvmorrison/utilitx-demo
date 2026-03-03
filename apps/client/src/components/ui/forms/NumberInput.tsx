"use client";

import React, { useId } from "react";
import Icon from "../primitives/Icon";
import { InputSize } from "./Input";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size" | "type" | "onChange" | "value"
  > {
  label?: string;
  helperText?: string;
  error?: string;
  inputSize?: InputSize;
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showControls?: boolean;
}

const inputSizeClasses: Record<InputSize, string> = {
  sm: "py-1 text-xs rounded-[--radius-sm]",
  md: "py-2 text-sm rounded-[--radius-md]",
  lg: "py-3 text-base rounded-[--radius-lg]",
};

const controlSizeClasses: Record<InputSize, string> = {
  sm: "w-6 text-xs",
  md: "w-8 text-sm",
  lg: "w-10 text-base",
};

export default function NumberInput({
  label,
  helperText,
  error,
  inputSize = "md",
  value,
  onChange,
  min,
  max,
  step = 1,
  showControls = true,
  id: idProp,
  disabled,
  className,
  ...rest
}: NumberInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const helperId = `${id}-helper`;
  const hasError = Boolean(error);
  const helperContent = error ?? helperText;

  const atMin = min !== undefined && value !== undefined && value <= min;
  const atMax = max !== undefined && value !== undefined && value >= max;

  function handleDecrement() {
    const next = (value ?? 0) - step;
    if (min !== undefined && next < min) return;
    onChange?.(next);
  }

  function handleIncrement() {
    const next = (value ?? 0) + step;
    if (max !== undefined && next > max) return;
    onChange?.(next);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parsed = parseFloat(e.target.value);
    if (!isNaN(parsed)) onChange?.(parsed);
  }

  const baseClasses =
    "flex-1 border-y bg-[--input-bg] text-[--input-text] border-[--input-border] placeholder:text-[--input-placeholder] transition-colors duration-150 focus:outline-none focus:border-[--input-border-focus] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--input-border-focus)_20%,transparent)] disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none px-3 text-center";

  const errorClasses = hasError
    ? "border-[--input-border-error] focus:border-[--input-border-error]"
    : "";

  const wrapperBorderClasses = `flex items-stretch rounded-[--radius-md] border border-[--input-border] overflow-hidden ${hasError ? "border-[--input-border-error]" : ""}`;

  const controlBase =
    "flex items-center justify-center bg-[--input-bg] text-[--text-secondary] hover:bg-[--interactive-ghost-bg-hover] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed border-0";

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

      <div className={wrapperBorderClasses}>
        {showControls && (
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || atMin}
            aria-label="Decrement"
            className={`${controlBase} ${controlSizeClasses[inputSize]} border-r border-[--input-border]`}
          >
            <Icon name="minus" size="sm" />
          </button>
        )}

        <input
          id={id}
          type="number"
          value={value ?? ""}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={helperContent ? helperId : undefined}
          className={[
            baseClasses,
            inputSizeClasses[inputSize],
            errorClasses,
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />

        {showControls && (
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || atMax}
            aria-label="Increment"
            className={`${controlBase} ${controlSizeClasses[inputSize]} border-l border-[--input-border]`}
          >
            <Icon name="plus" size="sm" />
          </button>
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
