"use client";

import { useState, useCallback, useRef } from "react";
import type { ApiProjectFile } from "@/lib/api-types";
import FileTilesView from "./files/FileTilesView";
import FileUploadView from "./files/FileUploadView";

interface ProjectFilesPanelProps {
  files: ApiProjectFile[];
  isUploading: boolean;
  onUploadFiles: (files: File[]) => void;
  onDeleteFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
  getDownloadUrl: (fileId: string) => Promise<string>;
}

export default function ProjectFilesPanel({
  files,
  isUploading,
  onUploadFiles,
  onDeleteFile,
  onDownloadFile,
  getDownloadUrl,
}: ProjectFilesPanelProps) {
  const [view, setView] = useState<"browse" | "upload">("browse");
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const urlCache = useRef<Map<string, { url: string; ts: number }>>(new Map());

  const getCachedDownloadUrl = useCallback(
    async (fileId: string): Promise<string> => {
      const cached = urlCache.current.get(fileId);
      const TTL = 50 * 60 * 1000; // 50 min (URLs expire at 60 min)
      if (cached && Date.now() - cached.ts < TTL) return cached.url;
      const url = await getDownloadUrl(fileId);
      urlCache.current.set(fileId, { url, ts: Date.now() });
      return url;
    },
    [getDownloadUrl],
  );

  const handleAddFiles = useCallback((newFiles: File[]) => {
    setStagedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveStaged = useCallback((index: number) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    if (stagedFiles.length === 0) return;
    onUploadFiles(stagedFiles);
    setStagedFiles([]);
    setView("browse");
  }, [stagedFiles, onUploadFiles]);

  const handleBack = useCallback(() => {
    setStagedFiles([]);
    setView("browse");
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: 60,
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        minWidth: 300,
        maxHeight: "calc(100vh - 120px)",
        background: "rgb(10, 14, 22)",
        borderRadius: 10,
        padding: "16px 14px 14px",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 13,
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: 19,
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {view === "browse" ? (
        <FileTilesView
          files={files}
          onDeleteFile={onDeleteFile}
          onDownloadFile={onDownloadFile}
          getDownloadUrl={getCachedDownloadUrl}
          onAddFiles={() => setView("upload")}
        />
      ) : (
        <FileUploadView
          stagedFiles={stagedFiles}
          isUploading={isUploading}
          onAddFiles={handleAddFiles}
          onRemoveStaged={handleRemoveStaged}
          onSave={handleSave}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
