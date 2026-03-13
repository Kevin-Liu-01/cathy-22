"use client";

import { useState, useEffect, useRef } from "react";

const CONCURRENCY = 6;

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });
}

export function useImagePreloader(srcs: string[]) {
  const [loaded, setLoaded] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || srcs.length === 0) return;
    startedRef.current = true;

    let count = 0;
    const total = srcs.length;
    const queue = [...srcs];

    function processNext() {
      if (queue.length === 0) return;
      const src = queue.shift()!;
      loadImage(src).then(() => {
        count++;
        setLoaded(count);
        if (count >= total) {
          setIsComplete(true);
        } else {
          processNext();
        }
      });
    }

    const workers = Math.min(CONCURRENCY, total);
    for (let i = 0; i < workers; i++) {
      processNext();
    }
  }, [srcs]);

  return {
    progress: srcs.length > 0 ? loaded / srcs.length : 1,
    isComplete,
  };
}
