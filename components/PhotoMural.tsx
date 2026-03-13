"use client";

import { useMemo, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { GRID_COLS, SCROLL_DURATION_S } from "@/lib/constants";

export interface TileInfo {
  rect: DOMRect;
  naturalWidth: number;
  naturalHeight: number;
}

export interface PhotoMuralHandle {
  getRandomVisibleIndex: () => number | null;
  getTileInfo: (origIdx: number) => TileInfo | null;
}

interface PhotoMuralProps {
  images: string[];
  isPaused: boolean;
  highlightedIndex: number | null;
  onImageClick: (index: number) => void;
}

const PhotoMural = forwardRef<PhotoMuralHandle, PhotoMuralProps>(
  function PhotoMural({ images, isPaused, highlightedIndex, onImageClick }, ref) {
    const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const shuffledIndices = useMemo(() => {
      const indices = Array.from({ length: images.length }, (_, i) => i);
      let seed = 42;
      for (let i = indices.length - 1; i > 0; i--) {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        const j = seed % (i + 1);
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      const remainder = indices.length % GRID_COLS;
      if (remainder !== 0) {
        const pad = GRID_COLS - remainder;
        const mid = Math.floor(indices.length / 2);
        for (let p = 0; p < pad; p++) {
          indices.push(indices[(mid + p) % images.length]);
        }
      }
      return indices;
    }, [images.length]);

    const rows = shuffledIndices.length / GRID_COLS;

    const tiledImages = useMemo(() => {
      const result: { src: string; origIdx: number }[] = [];
      for (let by = 0; by < 2; by++) {
        for (let row = 0; row < rows; row++) {
          for (let bx = 0; bx < 2; bx++) {
            for (let col = 0; col < GRID_COLS; col++) {
              const idx = row * GRID_COLS + col;
              const origIdx = shuffledIndices[idx];
              result.push({ src: images[origIdx], origIdx });
            }
          }
        }
      }
      return result;
    }, [shuffledIndices, rows, images]);

    const getRandomVisibleIndex = useCallback((): number | null => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const visible = new Set<number>();

      for (let i = 0; i < tiledImages.length; i++) {
        const el = tileRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cx = (rect.left + rect.right) / 2;
        const cy = (rect.top + rect.bottom) / 2;
        if (cx > 0 && cx < vw && cy > 0 && cy < vh) {
          visible.add(tiledImages[i].origIdx);
        }
      }

      if (visible.size === 0) return null;
      const arr = Array.from(visible);
      return arr[Math.floor(Math.random() * arr.length)];
    }, [tiledImages]);

    const getTileInfo = useCallback((origIdx: number): TileInfo | null => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      for (let i = 0; i < tiledImages.length; i++) {
        if (tiledImages[i].origIdx !== origIdx) continue;
        const el = tileRefs.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cx = (rect.left + rect.right) / 2;
        const cy = (rect.top + rect.bottom) / 2;
        if (cx > 0 && cx < vw && cy > 0 && cy < vh) {
          const img = el.querySelector("img");
          return {
            rect,
            naturalWidth: img?.naturalWidth ?? rect.width,
            naturalHeight: img?.naturalHeight ?? rect.height,
          };
        }
      }
      return null;
    }, [tiledImages]);

    useImperativeHandle(ref, () => ({ getRandomVisibleIndex, getTileInfo }), [getRandomVisibleIndex, getTileInfo]);

    const setTileRef = useCallback((el: HTMLButtonElement | null, i: number) => {
      tileRefs.current[i] = el;
    }, []);

    const isHighlighting = highlightedIndex !== null;

    return (
      <div className={`mural-viewport ${isHighlighting ? "mural-viewport--highlighting" : ""}`}>
        <div
          className="mural-scroll-layer"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS * 2}, var(--tile-w))`,
            animationDuration: `${SCROLL_DURATION_S}s`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {tiledImages.map((tile, i) => {
            const isHighlighted = isHighlighting && tile.origIdx === highlightedIndex;
            return (
              <button
                key={i}
                ref={(el) => setTileRef(el, i)}
                className={`mural-tile ${isHighlighted ? "mural-tile--highlighted" : ""}`}
                onClick={() => onImageClick(tile.origIdx)}
                type="button"
              >
                <img
                  src={tile.src}
                  alt=""
                  className="mural-tile-img"
                  loading="eager"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  }
);

export default PhotoMural;
