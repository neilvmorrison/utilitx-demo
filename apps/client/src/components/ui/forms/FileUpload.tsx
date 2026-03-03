"use client";

import React, { useId, useRef, useState } from "react";
import Icon from "../primitives/Icon";
import IconButton from "../primitives/IconButton";
import Text from "../primitives/Text";

export type FileUploadMode = "single" | "multi";

export interface FileUploadProps {
  mode?: FileUploadMode;
  accept?: string;
  maxSize?: number;
  onFilesChange: (files: File[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUpload({
  mode = "single",
  accept,
  maxSize,
  onFilesChange,
  label,
  helperText,
  error,
  disabled = false,
}: FileUploadProps) {
  const instanceId = useId();
  const helperId = `${instanceId}-helper`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const hasError = Boolean(error);
  const helperContent = error ?? helperText;

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const arr = Array.from(incoming);
    const filtered = maxSize ? arr.filter((f) => f.size <= maxSize) : arr;
    const next = mode === "single" ? filtered.slice(0, 1) : [...files, ...filtered];
    setFiles(next);
    onFilesChange(next);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFilesChange(next);
  }

  function handleClick() {
    if (!disabled) inputRef.current?.click();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) addFiles(e.dataTransfer.files);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  const dropZoneClasses = [
    "flex flex-col items-center justify-center gap-3 w-full min-h-[120px]",
    "rounded-[--radius-lg] border-2 border-dashed",
    "cursor-pointer transition-colors duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-primary-500]",
    isDragging
      ? "border-[--color-primary-400] bg-[color-mix(in_srgb,var(--color-primary-400)_10%,transparent)]"
      : hasError
        ? "border-[--input-border-error] bg-[--surface-2]"
        : "border-[--border-default] bg-[--surface-2]",
    "text-[--text-secondary]",
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="block text-xs font-medium text-[--input-label]">
          {label}
        </span>
      )}

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload ${mode === "multi" ? "files" : "file"}`}
        aria-describedby={helperContent ? helperId : undefined}
        aria-invalid={hasError || undefined}
        className={dropZoneClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={mode === "multi"}
          className="sr-only"
          onChange={handleInputChange}
          tabIndex={-1}
        />

        <Icon name="upload" size="lg" />
        <Text as="span" size="sm" color="secondary">
          Drop {mode === "multi" ? "files" : "a file"} here or{" "}
          <span className="text-[--color-primary-500] font-medium">click to browse</span>
        </Text>
        {accept && (
          <Text as="span" size="xs" color="tertiary">
            Accepted: {accept}
          </Text>
        )}
        {maxSize && (
          <Text as="span" size="xs" color="tertiary">
            Max size: {formatBytes(maxSize)}
          </Text>
        )}
      </div>

      {files.length > 0 && (
        <ul className="flex flex-col gap-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 px-3 py-2 rounded-[--radius-md] bg-[--surface-3]"
            >
              <Icon name="file" size="sm" className="shrink-0 text-[--text-tertiary]" />
              <Text as="span" size="sm" truncate className="flex-1">
                {file.name}
              </Text>
              <Text as="span" size="xs" color="tertiary" className="shrink-0">
                {formatBytes(file.size)}
              </Text>
              <IconButton
                icon={<Icon name="close" size="sm" />}
                aria-label={`Remove ${file.name}`}
                size="sm"
                variant="ghost"
                onClick={() => removeFile(i)}
              />
            </li>
          ))}
        </ul>
      )}

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
