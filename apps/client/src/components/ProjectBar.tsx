"use client";

import { useState } from "react";
import type { Project } from "@/hooks/useProjects";

interface ProjectBarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onShareViewState: () => Promise<boolean>;
}

export default function ProjectBar({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onShareViewState,
}: ProjectBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  function handleCreate() {
    const name = newProjectName.trim();
    if (!name) return;
    onCreateProject(name);
    setNewProjectName("");
    setIsOpen(false);
  }

  function startRename(project: Project) {
    setRenamingId(project.id);
    setRenameValue(project.name);
  }

  function commitRename() {
    if (renamingId && renameValue.trim()) {
      onRenameProject(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }

  async function handleShare() {
    const copied = await onShareViewState();
    if (!copied) return;
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1200);
  }

  const panelStyle: React.CSSProperties = {
    background: "rgba(10, 14, 22, 0.88)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: "#fff",
    fontFamily: "system-ui, -apple-system, sans-serif",
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        userSelect: "none",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Trigger */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          style={{
            ...panelStyle,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            minWidth: 180,
            textAlign: "left",
          }}
        >
          <span style={{ color: "#3a7bd5", fontSize: 14, flexShrink: 0 }}>◈</span>
          <span style={{ flex: 1 }}>
            {activeProject ? activeProject.name : "Select project…"}
          </span>
          <span style={{ color: "#555", fontSize: 10, flexShrink: 0 }}>
            {isOpen ? "▲" : "▾"}
          </span>
        </button>

        <button
          onClick={handleShare}
          title="Copy shareable view link"
          aria-label="Copy shareable view link"
          style={{
            ...panelStyle,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            padding: 0,
            cursor: "pointer",
            color: isCopied ? "#3a7bd5" : "#ddd",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 6.364 6.364l-2.636 2.636a4.5 4.5 0 0 1-6.364-6.364m2.636-2.636 2.636-2.636a4.5 4.5 0 1 0-6.364-6.364L6.826 2.324a4.5 4.5 0 0 0 6.364 6.364"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 19 }}
          />

          {/* Dropdown */}
          <div
            style={{
              ...panelStyle,
              position: "absolute",
              top: "calc(100% + 6px)",
              left: "50%",
              transform: "translateX(-50%)",
              minWidth: 240,
              zIndex: 20,
              overflow: "hidden",
            }}
          >
            {projects.length === 0 && (
              <div
                style={{ padding: "10px 12px", color: "#555", fontSize: 12 }}
              >
                No projects yet
              </div>
            )}

            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "7px 10px",
                  background:
                    project.id === activeProject?.id
                      ? "rgba(58,123,213,0.12)"
                      : "transparent",
                  borderLeft:
                    project.id === activeProject?.id
                      ? "2px solid #3a7bd5"
                      : "2px solid transparent",
                }}
              >
                {renamingId === project.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onBlur={commitRename}
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid #3a7bd5",
                      borderRadius: 4,
                      color: "#fff",
                      fontSize: 12,
                      padding: "2px 6px",
                      outline: "none",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  />
                ) : (
                  <span
                    onClick={() => {
                      onSelectProject(project.id);
                      setIsOpen(false);
                    }}
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: "#ddd",
                      cursor: "pointer",
                    }}
                  >
                    {project.name}
                  </span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(project);
                  }}
                  title="Rename project"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#555",
                    cursor: "pointer",
                    fontSize: 11,
                    padding: "2px 4px",
                    lineHeight: 1,
                  }}
                >
                  ✎
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  title="Delete project"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#555",
                    cursor: "pointer",
                    fontSize: 16,
                    padding: "0 3px",
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {/* New project row */}
            <div
              style={{
                borderTop: "1px solid #1e2230",
                padding: "8px 10px",
                display: "flex",
                gap: 6,
              }}
            >
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                }}
                placeholder="New project name…"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid #2a2e3d",
                  borderRadius: 5,
                  color: "#ddd",
                  fontSize: 12,
                  padding: "4px 7px",
                  outline: "none",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              />
              <button
                onClick={handleCreate}
                style={{
                  background: "#1e5fa8",
                  border: "none",
                  borderRadius: 5,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 16,
                  fontWeight: 700,
                  padding: "0 10px",
                  lineHeight: 1,
                }}
              >
                +
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
