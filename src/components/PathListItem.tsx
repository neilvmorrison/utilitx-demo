"use client";

import type { DrawnPath } from "@/hooks/usePaths";

const ghostInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid transparent",
  color: "#ddd",
  padding: "1px 2px",
  outline: "none",
  cursor: "text",
};

const numInputStyle: React.CSSProperties = {
  width: 44,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid #2a2e3d",
  borderRadius: 4,
  color: "#ddd",
  fontSize: 11,
  padding: "2px 4px",
  outline: "none",
  fontFamily: "monospace",
};

interface PathListItemProps {
  path: DrawnPath;
  isEditing: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdateName: (name: string) => void;
  onUpdateColor: (color: string) => void;
  onUpdateWidth: (width: number) => void;
  onUpdateNodeName: (nodeId: string, name: string) => void;
  onUpdateNodeZ: (nodeId: string, z: number) => void;
  onDelete: () => void;
}

export default function PathListItem({
  path,
  isEditing,
  isExpanded,
  onToggleExpand,
  onUpdateName,
  onUpdateColor,
  onUpdateWidth,
  onUpdateNodeName,
  onUpdateNodeZ,
  onDelete,
}: PathListItemProps) {
  return (
    <div
      style={{
        background: isEditing
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.04)",
        borderRadius: 6,
        padding: "7px 8px",
        border: isEditing
          ? "1px solid rgba(255,255,255,0.15)"
          : "1px solid transparent",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <button
          onClick={onToggleExpand}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            cursor: "pointer",
            fontSize: 9,
            padding: 0,
            lineHeight: 1,
            flexShrink: 0,
            width: 12,
          }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
        <input
          type="text"
          value={path.name}
          onChange={(e) => onUpdateName(e.target.value)}
          style={{ ...ghostInputStyle, flex: 1, fontSize: 12, minWidth: 0 }}
          onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#3a7bd5")}
          onBlur={(e) =>
            (e.currentTarget.style.borderBottomColor = "transparent")
          }
        />
        {path.isClosed && (
          <span
            style={{
              fontSize: 9,
              color: "#5a9",
              background: "rgba(90,170,100,0.15)",
              border: "1px solid rgba(90,170,100,0.3)",
              borderRadius: 3,
              padding: "1px 4px",
              flexShrink: 0,
            }}
          >
            area
          </span>
        )}
        <input
          type="color"
          value={path.color}
          onChange={(e) => onUpdateColor(e.target.value)}
          style={{
            width: 20,
            height: 20,
            border: "none",
            background: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
          title="Change color"
        />
        <button
          onClick={onDelete}
          style={{
            background: "none",
            border: "none",
            color: "#555",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            padding: "0 2px",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {/* Width row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 5,
          paddingLeft: 16,
        }}
      >
        <span style={{ color: "#555", fontSize: 10 }}>W</span>
        <input
          type="range"
          min={1}
          max={20}
          value={path.width}
          onChange={(e) => onUpdateWidth(Number(e.target.value))}
          style={{ flex: 1, accentColor: path.color }}
        />
        <span
          style={{
            color: "#666",
            fontFamily: "monospace",
            fontSize: 10,
            width: 24,
            textAlign: "right",
            flexShrink: 0,
          }}
        >
          {path.width}px
        </span>
      </div>

      {/* Collapsed: node count */}
      {!isExpanded && (
        <div
          style={{ fontSize: 10, color: "#444", marginTop: 3, paddingLeft: 16 }}
        >
          {path.nodes.length} node{path.nodes.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Expanded: per-node name + z */}
      {isExpanded && (
        <div
          style={{
            marginTop: 8,
            paddingLeft: 16,
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          {path.nodes.map((node, i) => (
            <div
              key={node.id}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              <span
                style={{
                  color: i === 0 ? "#fff" : "#3a7bd5",
                  fontSize: 7,
                  flexShrink: 0,
                }}
              >
                ●
              </span>
              <input
                type="text"
                value={node.name}
                onChange={(e) => onUpdateNodeName(node.id, e.target.value)}
                style={{
                  ...ghostInputStyle,
                  fontSize: 11,
                  color: "#bbb",
                  width: 80,
                  flexShrink: 0,
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderBottomColor = "#3a7bd5")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderBottomColor = "transparent")
                }
              />
              <span style={{ color: "#555", fontSize: 11 }}>Z</span>
              <input
                type="number"
                value={node.z}
                step={1}
                onChange={(e) =>
                  onUpdateNodeZ(node.id, parseFloat(e.target.value) || 0)
                }
                style={numInputStyle}
              />
              <span style={{ color: "#444", fontSize: 11 }}>m</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
