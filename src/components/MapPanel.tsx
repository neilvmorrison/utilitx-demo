"use client";

import { useState } from "react";
import type { Node, DrawnPath } from "@/hooks/usePaths";
import { UTILITY_PRESETS } from "@/constants";
import PathListItem from "./PathListItem";

interface MapPanelProps {
  // Path data
  paths: DrawnPath[];
  pathCount: number;

  // Edit state
  editingPathId: string | null;
  selectedNodeIds: Set<string>;

  // Drawing state (read-only)
  isDrawing: boolean;
  activePath: Node[];
  extendingPath: DrawnPath | null;
  isSnapping: boolean;
  snapIsFirstNode: boolean;

  // New path settings
  pathName: string;
  activeColor: string;
  activeWidth: number;

  // Setters for new path settings
  onPathNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;

  // Drawing actions
  onStartDrawing: () => void;
  onStartExtending: (pathId: string) => void;
  onCancelDrawing: () => void;
  onFinishPath: () => void;
  onFinishExtension: () => void;

  // Edit/path management actions
  onClearEditing: () => void;
  onDeletePath: (id: string) => void;
  onUpdatePathName: (id: string, name: string) => void;
  onUpdatePathColor: (id: string, color: string) => void;
  onUpdatePathWidth: (id: string, width: number) => void;
  onUpdateNodeName: (pathId: string, nodeId: string, name: string) => void;
  onUpdateNodeZ: (pathId: string, nodeId: string, z: number) => void;
  onTogglePathVisibility: (id: string) => void;
}

export default function MapPanel({
  paths,
  pathCount,
  editingPathId,
  selectedNodeIds,
  isDrawing,
  activePath,
  extendingPath,
  isSnapping,
  snapIsFirstNode,
  pathName,
  activeColor,
  activeWidth,
  onPathNameChange,
  onColorChange,
  onWidthChange,
  onStartDrawing,
  onStartExtending,
  onCancelDrawing,
  onFinishPath,
  onFinishExtension,
  onClearEditing,
  onDeletePath,
  onUpdatePathName,
  onUpdatePathColor,
  onUpdatePathWidth,
  onUpdateNodeName,
  onUpdateNodeZ,
  onTogglePathVisibility,
}: MapPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [presetOpen, setPresetOpen] = useState(false);
  const [expandedPathId, setExpandedPathId] = useState<string | null>(null);

  const selCount = selectedNodeIds.size;

  function toggleExpand(id: string) {
    setExpandedPathId((prev) => (prev === id ? null : id));
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 268,
        background: "rgba(10, 14, 22, 0.88)",
        borderRadius: 10,
        padding: "14px 14px",
        color: "#fff",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 13,
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        zIndex: 10,
        userSelect: "none",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: isCollapsed ? 0 : 12,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14 }}>Line Paths</span>
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            cursor: "pointer",
            fontSize: 11,
            lineHeight: 1,
            padding: "2px 4px",
          }}
          title={isCollapsed ? "Expand panel" : "Collapse panel"}
        >
          {isCollapsed ? "▼" : "▲"}
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Edit mode status bar */}
          {editingPathId && !isDrawing && (
            <div
              style={{
                marginBottom: 8,
                padding: "6px 9px",
                background: "rgba(255,255,255,0.06)",
                borderRadius: 5,
                border: "1px solid rgba(255,255,255,0.12)",
                fontSize: 11,
                color: "#bbb",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 6,
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                Editing:{" "}
                <strong style={{ color: "#fff" }}>
                  {paths.find((p) => p.id === editingPathId)?.name ?? ""}
                </strong>
                {selCount > 0 && (
                  <span style={{ color: "#ffd900" }}>
                    {" "}
                    · {selCount} node{selCount !== 1 ? "s" : ""}
                  </span>
                )}
              </span>
              <button
                onClick={onClearEditing}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
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
          )}

          {/* Edit mode hints */}
          {editingPathId && !isDrawing && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 10,
                color: "#555",
                lineHeight: 1.6,
              }}
            >
              {selCount > 1
                ? "Drag any selected node to move all · Del to delete · Shift+click to adjust"
                : selCount === 1
                  ? "Drag to move · Del to remove · Shift+click to add to selection"
                  : "Click node to select · Shift+click multi-select · Drag to move · Esc to exit"}
            </div>
          )}

          {/* Name for next path */}
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              marginBottom: 10,
            }}
          >
            <span style={{ color: "#999", fontSize: 11 }}>Name</span>
            <input
              type="text"
              value={pathName}
              onChange={(e) => onPathNameChange(e.target.value)}
              placeholder={`Path ${pathCount}`}
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid #2a2e3d",
                borderRadius: 5,
                color: "#ddd",
                fontSize: 13,
                padding: "5px 8px",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
              }}
            />
          </label>

          {/* Utility type preset dropdown */}
          <div style={{ marginBottom: 10, position: "relative" }}>
            <span
              style={{
                color: "#999",
                fontSize: 11,
                display: "block",
                marginBottom: 4,
              }}
            >
              Type
            </span>
            <button
              onClick={() => setPresetOpen((v) => !v)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 8px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid #2a2e3d",
                borderRadius: 5,
                color: "#ddd",
                cursor: "pointer",
                fontSize: 12,
                textAlign: "left",
              }}
            >
              <span
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 3,
                  flexShrink: 0,
                  background: activeColor,
                  border:
                    activeColor.toLowerCase() === "#ffffff"
                      ? "1px solid #666"
                      : "none",
                  display: "inline-block",
                }}
              />
              <span style={{ flex: 1 }}>
                {UTILITY_PRESETS.find(
                  (p) => p.color.toLowerCase() === activeColor.toLowerCase(),
                )?.label ?? "Custom"}
              </span>
              <span style={{ color: "#555", fontSize: 10 }}>
                {presetOpen ? "▲" : "▾"}
              </span>
            </button>

            {presetOpen && (
              <>
                <div
                  onClick={() => setPresetOpen(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 19 }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: "rgba(8, 12, 22, 0.98)",
                    border: "1px solid #2a2e3d",
                    borderRadius: 6,
                    overflow: "hidden",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.7)",
                  }}
                >
                  {UTILITY_PRESETS.map((preset) => (
                    <div
                      key={preset.color}
                      onClick={() => {
                        onColorChange(preset.color);
                        setPresetOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "7px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#ccc",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.08)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <span
                        style={{
                          width: 13,
                          height: 13,
                          borderRadius: 3,
                          flexShrink: 0,
                          background: preset.color,
                          display: "inline-block",
                          border:
                            preset.color === "#FFFFFF"
                              ? "1px solid #555"
                              : "none",
                        }}
                      />
                      <span>{preset.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Color + Width row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                flex: 1,
              }}
            >
              <span style={{ color: "#999", fontSize: 11 }}>Color</span>
              <input
                type="color"
                value={activeColor}
                onChange={(e) => onColorChange(e.target.value)}
                style={{
                  width: 28,
                  height: 22,
                  border: "1px solid #333",
                  borderRadius: 4,
                  background: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
              <span
                style={{
                  color: "#777",
                  fontFamily: "monospace",
                  fontSize: 11,
                }}
              >
                {activeColor}
              </span>
            </label>
          </div>

          {/* Width slider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span style={{ color: "#999", fontSize: 11, flexShrink: 0 }}>
              Width
            </span>
            <input
              type="range"
              min={1}
              max={20}
              value={activeWidth}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: activeColor }}
            />
            <span
              style={{
                color: "#777",
                fontFamily: "monospace",
                fontSize: 11,
                width: 28,
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {activeWidth}px
            </span>
          </div>

          {/* Action buttons */}
          {!isDrawing ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={onStartDrawing}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 6,
                  border: "none",
                  background: "#1e5fa8",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                New Path
              </button>
              {editingPathId && (
                <button
                  onClick={() => onStartExtending(editingPathId)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 6,
                    border: "none",
                    background: "#4a3a8a",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Add Node
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {activePath.length >= (extendingPath ? 1 : 2) && (
                  <button
                    onClick={extendingPath ? onFinishExtension : onFinishPath}
                    style={{
                      flex: 1,
                      padding: "8px 0",
                      borderRadius: 6,
                      border: "none",
                      background: "#1a7a3c",
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                  >
                    {extendingPath ? "Apply" : "Finish Path"}
                  </button>
                )}
                <button
                  onClick={onCancelDrawing}
                  style={{
                    flex: activePath.length >= 2 ? undefined : 1,
                    width: activePath.length >= 2 ? undefined : "100%",
                    padding: "8px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: "#9b2335",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  padding: "5px 8px",
                  borderRadius: 4,
                  background: isSnapping
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(255,255,255,0.05)",
                  color: isSnapping ? "#fff" : "#aaa",
                  transition: "background 0.1s",
                }}
              >
                {isSnapping
                  ? snapIsFirstNode
                    ? "Click to close area"
                    : "Click to connect & close"
                  : activePath.length === 0
                    ? extendingPath
                      ? "Click to place first new node"
                      : "Click to place first node"
                    : extendingPath
                      ? `${activePath.length} new node${activePath.length !== 1 ? "s" : ""} — click to extend`
                      : `${activePath.length} node${activePath.length !== 1 ? "s" : ""} — click to extend`}
              </div>
            </div>
          )}

          {/* Paths list */}
          {paths.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  color: "#555",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                  borderTop: "1px solid #1e2230",
                  paddingTop: 12,
                }}
              >
                {paths.length} path{paths.length !== 1 ? "s" : ""}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  maxHeight: 360,
                  overflowY: "auto",
                }}
              >
                {paths.map((path) => (
                  <PathListItem
                    key={path.id}
                    path={path}
                    isEditing={path.id === editingPathId}
                    isExpanded={path.id === expandedPathId}
                    onToggleExpand={() => toggleExpand(path.id)}
                    onUpdateName={(name) => onUpdatePathName(path.id, name)}
                    onUpdateColor={(color) => onUpdatePathColor(path.id, color)}
                    onUpdateWidth={(width) => onUpdatePathWidth(path.id, width)}
                    onUpdateNodeName={(nodeId, name) =>
                      onUpdateNodeName(path.id, nodeId, name)
                    }
                    onUpdateNodeZ={(nodeId, z) =>
                      onUpdateNodeZ(path.id, nodeId, z)
                    }
                    onDelete={() => onDeletePath(path.id)}
                    isHidden={path.isHidden}
                    onToggleHidden={() => onTogglePathVisibility(path.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
