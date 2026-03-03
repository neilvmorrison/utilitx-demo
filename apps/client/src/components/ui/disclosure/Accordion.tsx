"use client";

import React, { useRef } from "react";
import Icon from "../primitives/Icon";

export interface AccordionItemProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItemProps[];
  allowMultiple?: boolean;
  className?: string;
}

interface AccordionItemInternalProps extends AccordionItemProps {
  onToggle: (id: string, open: boolean) => void;
  isControlled: boolean;
}

function AccordionItem({
  id,
  title,
  children,
  defaultOpen = false,
  open,
  onOpenChange,
  disabled = false,
  onToggle,
  isControlled,
}: AccordionItemInternalProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    const isOpen = (e.currentTarget as HTMLDetailsElement).open;
    onOpenChange?.(isOpen);
    onToggle(id, isOpen);
  }

  // For controlled mode, sync the open attribute
  const openProp = isControlled ? { open: open ?? false } : { defaultOpen };

  return (
    <details
      ref={detailsRef}
      {...openProp}
      onToggle={handleToggle}
      className="border-b border-[--accordion-border] last:border-b-0"
    >
      <summary
        className={[
          "list-none [&::-webkit-details-marker]:hidden",
          "flex items-center justify-between gap-2",
          "py-3 px-1 text-sm font-medium text-[--accordion-trigger]",
          "cursor-pointer select-none",
          "hover:text-[--text-primary] transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--color-primary-500]",
          disabled ? "opacity-50 pointer-events-none" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        <span>{title}</span>
        <Icon
          name="chevron-down"
          size="sm"
          className="shrink-0 transition-transform duration-200 [details[open]_&]:rotate-180"
        />
      </summary>

      <div className="pb-3 px-1 text-sm text-[--accordion-content]">
        {children}
      </div>
    </details>
  );
}

export default function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  // Determine if any items are externally controlled
  const hasControlledItems = items.some((item) => item.open !== undefined);

  // For uncontrolled multi=false: track which item is open internally
  const [openId, setOpenId] = React.useState<string | null>(() => {
    if (allowMultiple || hasControlledItems) return null;
    const firstOpen = items.find((i) => i.defaultOpen);
    return firstOpen?.id ?? null;
  });

  function handleToggle(id: string, isOpen: boolean) {
    if (allowMultiple || hasControlledItems) return;
    // Close all others when one opens
    if (isOpen) {
      setOpenId(id);
      // Force-close siblings by toggling their details elements
    } else if (openId === id) {
      setOpenId(null);
    }
  }

  return (
    <div className={["rounded-[--radius-md] border border-[--accordion-border] overflow-hidden", className ?? ""].filter(Boolean).join(" ")}>
      {items.map((item) => {
        const isControlled = item.open !== undefined;
        // For uncontrolled allowMultiple=false: override open based on openId
        const resolvedOpen =
          !isControlled && !allowMultiple
            ? item.id === openId
            : item.open;

        return (
          <AccordionItem
            key={item.id}
            {...item}
            open={resolvedOpen}
            isControlled={isControlled || !allowMultiple}
            onToggle={handleToggle}
          />
        );
      })}
    </div>
  );
}
