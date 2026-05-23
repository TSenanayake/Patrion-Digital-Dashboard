import { useEffect, useRef } from "react";

interface UseScrollGateOptions {
  enabled: boolean;
  contentRef: React.RefObject<HTMLElement | null>;
  onScrolledToBottom: () => void;
  debounceMs?: number;
}

export function useScrollGate({
  enabled,
  contentRef,
  onScrolledToBottom,
  debounceMs = 100,
}: UseScrollGateOptions): void {
  const onScrolledRef = useRef(onScrolledToBottom);
  onScrolledRef.current = onScrolledToBottom;

  useEffect(() => {
    if (!enabled) return;

    const el = contentRef.current;
    if (!el) return;

    const check = () => {
      const rect = el.getBoundingClientRect();
      const contentBottom = rect.bottom;
      const viewportHeight = window.innerHeight;
      if (contentBottom <= viewportHeight + 80) {
        onScrolledRef.current();
      }
    };

    const handleScroll = () => {
      check();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    check();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, contentRef]);
}

export function useAutoScrollGate({
  enabled,
  contentRef,
  onScrolledToBottom,
  debounceMs = 300,
}: UseScrollGateOptions): void {
  const onScrolledRef = useRef(onScrolledToBottom);
  onScrolledRef.current = onScrolledToBottom;

  useEffect(() => {
    if (!enabled) return;

    const el = contentRef.current;
    if (!el) return;

    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= window.innerHeight + 80) {
        onScrolledRef.current();
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [enabled, contentRef, debounceMs]);
}
