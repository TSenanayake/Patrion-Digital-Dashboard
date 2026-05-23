import { useEffect } from "react";
import type { WorkerAction } from "@/lib/workerFlow";

export function useWorkerScrollGate(
  phase: string,
  docSubPhase: string,
  hasScrolledToBottom: boolean,
  docIndex: number,
  ref: React.RefObject<HTMLDivElement | null>,
  dispatch: React.Dispatch<WorkerAction>
) {
  useEffect(() => {
    if (phase !== "documents" || docSubPhase !== "reading" || hasScrolledToBottom) return;
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const contentBottom = rect.bottom;
      const viewportHeight = window.innerHeight;
      if (contentBottom <= viewportHeight + 80) {
        dispatch({ type: 'SET_SCROLLED' });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase, docSubPhase, hasScrolledToBottom, docIndex, ref, dispatch]);
}
