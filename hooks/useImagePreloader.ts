"use client";

import { useState, useEffect, useRef } from "react";

export function useImagePreloader(srcs: string[]) {
  const [loaded, setLoaded] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || srcs.length === 0) return;
    startedRef.current = true;

    let count = 0;
    const total = srcs.length;

    srcs.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        count++;
        setLoaded(count);
        if (count >= total) setIsComplete(true);
      };
      img.src = src;
    });
  }, [srcs]);

  return {
    progress: srcs.length > 0 ? loaded / srcs.length : 1,
    isComplete,
  };
}
