"use client";

import { useState } from "react";
import { useKeyboardListener } from "@/hooks/useKeyboardListener";

interface NodeContextMenuProps {
  x: number;
  y: number;
  canSubdivide: boolean;
  onDelete: () => void;
  onSubdivide: () => void;
  onClose: () => void;
}

const MENU_WIDTH = 160;
const MENU_ITEM_HEIGHT = 32;

export default function NodeContextMenu({
  x,
  y,
  canSubdivide,
  onDelete,
  onSubdivide,
  onClose,
}: NodeContextMenuProps) {
  const [deleteHover, setDeleteHover] = useState(false);
  const [subdivideHover, setSubdivideHover] = useState(false);

  useKeyboardListener("Escape", onClose);

  const itemCount = canSubdivide ? 2 : 1;
  const menuHeight = itemCount * MENU_ITEM_HEIGHT + 8; // 4px padding top + bottom

  const clampedX = Math.min(x, window.innerWidth - MENU_WIDTH - 4);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 4);

  const menuStyle: React.CSSProperties = {
    position: "fixed",
    left: clampedX,
    top: clampedY,
    width: MENU_WIDTH,
    background: "rgba(10, 14, 22, 0.92)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 6,
    boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
    zIndex: 20,
    padding: "4px 0",
    userSelect: "none",
  };

  const baseItemStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: MENU_ITEM_HEIGHT,
    padding: "0 12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    textAlign: "left",
    color: "rgba(255,255,255,0.85)",
    transition: "background 0.1s",
  };

  return (
    <>
      {/* Backdrop — click anywhere outside closes the menu */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 19 }}
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      <div style={menuStyle}>
        <button
          style={{
            ...baseItemStyle,
            color: deleteHover ? "#ff6b6b" : "rgba(255,255,255,0.85)",
            background: deleteHover ? "rgba(255,80,80,0.1)" : "transparent",
          }}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
          onClick={onDelete}
        >
          Delete selected
        </button>
        {canSubdivide && (
          <button
            style={{
              ...baseItemStyle,
              background: subdivideHover
                ? "rgba(255,255,255,0.08)"
                : "transparent",
            }}
            onMouseEnter={() => setSubdivideHover(true)}
            onMouseLeave={() => setSubdivideHover(false)}
            onClick={onSubdivide}
          >
            Subdivide edge
          </button>
        )}
      </div>
    </>
  );
}
