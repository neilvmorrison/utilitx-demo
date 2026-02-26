import { useEffect, useRef } from "react";

// Typed overloads for common targets
export function useEventListener<K extends keyof WindowEventMap>(
  target: Window | null | undefined,
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document | null | undefined,
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void;
export function useEventListener<
  T extends HTMLElement,
  K extends keyof HTMLElementEventMap,
>(
  target: T | null | undefined,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): void;
// Generic fallback
export function useEventListener(
  target: EventTarget | null | undefined,
  type: string,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener(
  target: EventTarget | null | undefined,
  type: string,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  // Keep handler ref stable so callers don't need to memoize
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!target) return;
    const listener = (e: Event) => handlerRef.current(e);
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
    // options intentionally omitted from deps — callers should pass a stable value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, type]);
}
