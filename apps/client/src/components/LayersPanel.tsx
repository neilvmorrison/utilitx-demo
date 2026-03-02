"use client";

import { useState } from "react";
import type { Layer } from "@/hooks/useLayers";
import { DEFAULT_LAYER_ID } from "@/hooks/useLayers";
import type { DrawnPath } from "@/hooks/usePaths";

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  paths: DrawnPath[];
  onSetActiveLayer: (id: string) => void;
  onCreateLayer: (name: string) => void;
  onUpdateLayerName: (id: string, name: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onDeleteLayer: (id: string) => void;
}

const ghostInputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "1px solid transparent",
  color: "#ddd",
  padding: "1px 2px",
  outline: "none",
  cursor: "text",
  flex: 1,
  fontSize: 12,
  minWidth: 0,
};

export default function LayersPanel({
  layers,
  activeLayerId,
  paths,
  onSetActiveLayer,
  onCreateLayer,
  onUpdateLayerName,
  onToggleLayerVisibility,
  onDeleteLayer,
}: LayersPanelProps) {
  const [newLayerName, setNewLayerName] = useState("");

  function handleCreate() {
    const name = newLayerName.trim();
    if (!name) return;
    onCreateLayer(name);
    setNewLayerName("");
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: 52,
        left: 16,
        width: 220,
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
      {/* Title */}
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 10,
          color: "#fff",
        }}
      >
        Layers
      </div>

      {/* Layer list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {layers.map((layer) => {
          const pathCount = paths.filter((p) => p.layerId === layer.id).length;
          const isActive = layer.id === activeLayerId;
          const isDefault = layer.id === DEFAULT_LAYER_ID;

          return (
            <div
              key={layer.id}
              onClick={() => onSetActiveLayer(layer.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 6px",
                borderRadius: 5,
                background: isActive
                  ? "rgba(58, 123, 213, 0.12)"
                  : "rgba(255,255,255,0.02)",
                border: isActive
                  ? "1px solid rgba(58, 123, 213, 0.3)"
                  : "1px solid transparent",
                cursor: "pointer",
              }}
            >
              {/* Active indicator */}
              <span
                style={{
                  fontSize: 10,
                  color: isActive ? "#3a7bd5" : "#444",
                  flexShrink: 0,
                  width: 12,
                  lineHeight: 1,
                }}
              >
                {isActive ? "◉" : "◎"}
              </span>

              {/* Inline name edit */}
              <input
                type="text"
                value={layer.name}
                onChange={(e) => onUpdateLayerName(layer.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={ghostInputStyle}
                onFocus={(e) =>
                  (e.currentTarget.style.borderBottomColor = "#3a7bd5")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderBottomColor = "transparent")
                }
              />

              {/* Path count */}
              {pathCount > 0 && (
                <span
                  style={{ color: "#444", fontSize: 10, flexShrink: 0 }}
                >
                  ({pathCount})
                </span>
              )}

              {/* Visibility toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLayerVisibility(layer.id);
                }}
                title={layer.isVisible ? "Hide layer" : "Show layer"}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  lineHeight: 1,
                  padding: "0 2px",
                  color: layer.isVisible ? "#aaa" : "#444",
                  flexShrink: 0,
                }}
              >
                {layer.isVisible ? "●" : "◌"}
              </button>

              {/* Delete — hidden for Default layer */}
              {!isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLayer(layer.id);
                  }}
                  title="Delete layer (paths moved to Default)"
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
              )}
            </div>
          );
        })}
      </div>

      {/* Create layer row */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid #1e2230",
        }}
      >
        <input
          type="text"
          value={newLayerName}
          onChange={(e) => setNewLayerName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="Layer name…"
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
  );
}
