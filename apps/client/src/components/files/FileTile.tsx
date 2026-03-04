"use client";

import { useState, useEffect, useRef } from "react";
import type { ApiProjectFile } from "@/lib/api-types";
import { formatBytes, mimeIcon } from "./file-utils";

interface FileTileProps {
  file: ApiProjectFile;
  onDownload: () => void;
  onDelete: () => void;
  getDownloadUrl: () => Promise<string>;
}

function isImage(mime: string) {
  return mime.startsWith("image/");
}

export default function FileTile({ file, onDownload, onDelete, getDownloadUrl }: FileTileProps) {
  const [hovered, setHovered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const getUrlRef = useRef(getDownloadUrl);
  getUrlRef.current = getDownloadUrl;

  useEffect(() => {
    if (!isImage(file.mimeType)) return;
    let cancelled = false;
    getUrlRef.current().then((url) => {
      if (!cancelled) setPreviewUrl(url);
    });
    return () => { cancelled = true; };
  }, [file.id, file.mimeType]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onDownload}
      style={{
        position: "relative",
        background: hovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
        borderRadius: 6,
        padding: 6,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        maxHeight: 130,
        transition: "background 0.15s",
      }}
    >
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete file"
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            background: "rgba(0,0,0,0.6)",
            border: "none",
            borderRadius: 4,
            color: "#aaa",
            cursor: "pointer",
            fontSize: 14,
            lineHeight: 1,
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          ×
        </button>
      )}

      <div
        style={{
          width: "100%",
          aspectRatio: "5 / 3",
          borderRadius: 4,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.03)",
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={file.fileName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 0.5 }}>
              {mimeIcon(file.mimeType)}
            </span>
            <span style={{ fontSize: 9, color: "#444" }}>No preview</span>
          </div>
        )}
      </div>

      <span
        title={file.fileName}
        style={{
          fontSize: 10,
          color: "#ccc",
          textAlign: "center",
          width: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {file.fileName}
      </span>

      <span style={{ fontSize: 8, color: "#555" }}>
        {formatBytes(file.fileSize)}
      </span>
    </div>
  );
}
