"use client";

import { useMotionValue, animate } from "framer-motion";
import { useRef } from "react";

export function useSheetDragDismiss(onClose: () => void) {
  const y = useMotionValue(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const isDraggingRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Skip if clicking an interactive element like button or input
    if ((e.target as HTMLElement).closest("button, input, select, textarea, a")) {
      return;
    }

    startYRef.current = e.clientY;
    startTimeRef.current = Date.now();
    isDraggingRef.current = true;

    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const currentY = e.clientY;
    const deltaY = currentY - startYRef.current;

    if (deltaY > 0) {
      y.set(deltaY);
    } else {
      // Elastic resistance when dragging upwards
      y.set(deltaY * 0.12);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }

    const currentY = y.get();
    const elapsedTime = Date.now() - startTimeRef.current;
    const deltaY = e.clientY - startYRef.current;
    const velocity = deltaY / (elapsedTime || 1);

    // If dragged down enough (> 80px) or fast flick down (velocity > 0.45)
    if (currentY > 80 || (deltaY > 30 && velocity > 0.45)) {
      animate(y, typeof window !== "undefined" ? window.innerHeight : 600, {
        duration: 0.22,
        ease: "easeOut",
        onComplete: () => {
          onClose();
          y.set(0);
        },
      });
    } else {
      // Bounce back to normal position
      animate(y, 0, {
        type: "spring",
        stiffness: 450,
        damping: 32,
      });
    }
  };

  return {
    y,
    dragHeaderProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      style: { touchAction: "none" as const, userSelect: "none" as const },
    },
  };
}
