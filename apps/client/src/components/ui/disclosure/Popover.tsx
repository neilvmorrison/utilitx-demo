"use client";

import React, { useEffect } from "react";

export interface IPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}

export default function Popover({
  isOpen,
  onClose,
  trigger,
  children,
  width = 320,
}: IPopoverProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  return (
    <div style={{ position: "relative" }}>
      {trigger}
      {isOpen && (
        <>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popover"
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              zIndex: 29,
            }}
          />
          <div
            role="dialog"
            aria-modal="false"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width,
              background: "rgba(10, 14, 22, 0.96)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              zIndex: 30,
              padding: 12,
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}
