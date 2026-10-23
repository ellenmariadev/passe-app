"use client";

import { useEffect, useRef, useState } from "react";

import { subscribeLoading } from "@/lib/loading";
import { cn } from "@/lib/utils";

export function GlobalLoadingBar() {
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeLoading((pending) => {
      if (pending > 0) {
        if (hideTimer.current) {
          clearTimeout(hideTimer.current);
          hideTimer.current = null;
        }
        setVisible(true);
      } else {
        hideTimer.current = setTimeout(() => setVisible(false), 250);
      }
    });
    return () => {
      unsubscribe();
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className={cn(
          "h-full w-full rounded-full transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="global-loading-bar h-full w-1/3 rounded-full bg-primary" />
      </div>
    </div>
  );
}
