"use client";

import { useState } from "react";
import type { Project } from "@/hooks/useProjects";
import Popover from "@/components/ui/disclosure/Popover";
import { Icon, IconButton } from "./ui";

interface IEmailRecipient {
  id: string;
  email: string;
}

interface IProjectBarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onGetShareViewStateLink: () => string | null;
  onCopyShareViewState: () => Promise<boolean>;
}

export default function ProjectBar({
  projects,
  activeProject,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  onGetShareViewStateLink,
  onCopyShareViewState,
}: IProjectBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailRecipients, setEmailRecipients] = useState<IEmailRecipient[]>([]);
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

  function addEmailRecipient() {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    if (emailRecipients.some((recipient) => recipient.email === trimmed))
      return;
    setEmailRecipients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: trimmed },
    ]);
    setEmailInput("");
  }

  function removeEmailRecipient(id: string) {
    setEmailRecipients((prev) =>
      prev.filter((recipient) => recipient.id !== id),
    );
  }

  async function handleCopyShareLink() {
    const copied = await onCopyShareViewState();
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
          <span style={{ color: "#3a7bd5", fontSize: 14, flexShrink: 0 }}>
            ◈
          </span>
          <span style={{ flex: 1 }}>
            {activeProject ? activeProject.name : "Select project…"}
          </span>
          <span style={{ color: "#555", fontSize: 10, flexShrink: 0 }}>
            {isOpen ? "▲" : "▾"}
          </span>
        </button>

        <Popover
          isOpen={isSharePopoverOpen}
          onClose={() => setIsSharePopoverOpen(false)}
          trigger={
            <IconButton
              onClick={() => setIsSharePopoverOpen((prev) => !prev)}
              icon={<Icon icon="share" />}
              aria-label="Share this view"
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
            />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>
              Share current view
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEmailRecipient();
                  }
                }}
                placeholder="Add email address"
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid #2a2e3d",
                  borderRadius: 5,
                  color: "#ddd",
                  fontSize: 12,
                  padding: "6px 8px",
                  outline: "none",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              />
              <button
                onClick={addEmailRecipient}
                style={{
                  background: "#1e5fa8",
                  border: "none",
                  borderRadius: 5,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "0 10px",
                }}
              >
                Add
              </button>
            </div>

            {emailRecipients.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {emailRecipients.map((recipient) => (
                  <span
                    key={recipient.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 999,
                      color: "#ddd",
                      fontSize: 11,
                      padding: "3px 8px",
                    }}
                  >
                    {recipient.email}
                    <button
                      onClick={() => removeEmailRecipient(recipient.id)}
                      aria-label={`Remove ${recipient.email}`}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#888",
                        cursor: "pointer",
                        fontSize: 12,
                        lineHeight: 1,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              readOnly
              value={onGetShareViewStateLink() ?? ""}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #2a2e3d",
                borderRadius: 5,
                color: "#9ea8b8",
                fontSize: 11,
                padding: "6px 8px",
                outline: "none",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <button
                disabled
                style={{
                  background: "rgba(58,123,213,0.45)",
                  border: "none",
                  borderRadius: 5,
                  color: "#fff",
                  cursor: "not-allowed",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                  opacity: 0.7,
                }}
              >
                Email link (UI only)
              </button>
              <button
                onClick={handleCopyShareLink}
                style={{
                  background: "#1e5fa8",
                  border: "none",
                  borderRadius: 5,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 10px",
                }}
              >
                {isCopied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>
        </Popover>
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
