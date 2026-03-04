"use client";

import type { ApiProjectFile } from "@/lib/api-types";
import FileTile from "./FileTile";

interface FileTilesViewProps {
  files: ApiProjectFile[];
  onDeleteFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
  getDownloadUrl: (fileId: string) => Promise<string>;
  onAddFiles: () => void;
}

export default function FileTilesView({
  files,
  onDeleteFile,
  onDownloadFile,
  getDownloadUrl,
  onAddFiles,
}: FileTilesViewProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflow: "hidden" }}>
      <div style={{ fontWeight: 600, fontSize: 14 }}>Project Files</div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: 6,
          alignContent: "start",
          paddingRight: 2,
        }}
      >
        {files.map((file) => (
          <FileTile
            key={file.id}
            file={file}
            onDownload={() => onDownloadFile(file.id)}
            onDelete={() => onDeleteFile(file.id)}
            getDownloadUrl={() => getDownloadUrl(file.id)}
          />
        ))}
      </div>

      {files.length === 0 && (
        <div style={{ color: "#555", fontSize: 12, padding: "12px 0", textAlign: "center" }}>
          No files uploaded yet
        </div>
      )}

      <button
        onClick={onAddFiles}
        style={{
          background: "#1e5fa8",
          border: "none",
          borderRadius: 6,
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "inherit",
          padding: "9px 0",
          cursor: "pointer",
          width: "100%",
          flexShrink: 0,
        }}
      >
        Add Files
      </button>
    </div>
  );
}
