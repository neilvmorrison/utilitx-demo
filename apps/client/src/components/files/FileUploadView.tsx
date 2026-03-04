"use client";

import { useMemo } from "react";
import FileUpload from "@/components/ui/forms/FileUpload";
import { formatBytes } from "./file-utils";

interface FileUploadViewProps {
  stagedFiles: File[];
  isUploading: boolean;
  onAddFiles: (files: File[]) => void;
  onRemoveStaged: (index: number) => void;
  onSave: () => void;
  onBack: () => void;
}

export default function FileUploadView({
  stagedFiles,
  isUploading,
  onAddFiles,
  onRemoveStaged,
  onSave,
  onBack,
}: FileUploadViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 16,
            padding: "0 2px",
            lineHeight: 1,
          }}
          title="Back to files"
        >
          ←
        </button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Upload Files</span>
      </div>

      <FileUpload
        mode="multi"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.svg,.xlsx,.csv"
        maxSize={50 * 1024 * 1024}
        onFilesChange={onAddFiles}
        showFileList={false}
      />

      {stagedFiles.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: "#888" }}>
            {stagedFiles.length} file{stagedFiles.length !== 1 ? "s" : ""} ready
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              paddingRight: 2,
            }}
          >
            {stagedFiles.map((file, i) => (
              <StagedFileRow key={`${file.name}-${i}`} file={file} index={i} onRemove={onRemoveStaged} />
            ))}
          </div>
        </>
      )}

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            background: "none",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            color: "#aaa",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            padding: "9px 0",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={stagedFiles.length === 0 || isUploading}
          style={{
            flex: 1,
            background: stagedFiles.length === 0 || isUploading ? "#1e5fa855" : "#1e5fa8",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            padding: "9px 0",
            cursor: stagedFiles.length === 0 || isUploading ? "not-allowed" : "pointer",
          }}
        >
          {isUploading ? "Uploading..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function StagedFileRow({ file, index, onRemove }: { file: File; index: number; onRemove: (i: number) => void }) {
  const previewUrl = useMemo(
    () => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "5px 8px",
        borderRadius: 5,
        background: "rgba(255,255,255,0.04)",
        fontSize: 12,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 4,
          overflow: "hidden",
          flexShrink: 0,
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 8, color: "#555", fontWeight: 700 }}>FILE</span>
        )}
      </div>
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "#ccc",
        }}
      >
        {file.name}
      </span>
      <span style={{ color: "#555", fontSize: 10, flexShrink: 0 }}>
        {formatBytes(file.size)}
      </span>
      <button
        onClick={() => onRemove(index)}
        style={{
          background: "none",
          border: "none",
          color: "#555",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: "0 2px",
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
