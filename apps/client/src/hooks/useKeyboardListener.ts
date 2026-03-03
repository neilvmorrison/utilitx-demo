import { useEffect, useLayoutEffect, useRef } from "react";

interface UseKeyboardListenerOptions {
  event?: "keydown" | "keyup";
  skipInputElements?: boolean;
  enabled?: boolean;
}

export function useKeyboardListener(
  key: string,
  handler: () => void,
  options?: UseKeyboardListenerOptions,
) {
  const {
    event = "keydown",
    skipInputElements = false,
    enabled = true,
  } = options ?? {};

  // Ref keeps the handler stable so callers don't need to memoize it
  const handlerRef = useRef(handler);
  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    function listener(e: KeyboardEvent) {
      if (e.key !== key) return;
      if (skipInputElements && (e.target as HTMLElement).tagName === "INPUT")
        return;
      handlerRef.current();
    }

    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [key, event, skipInputElements, enabled]);
}
