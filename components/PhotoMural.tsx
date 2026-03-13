"use client";

import {
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  memo,
} from "react";
import { GRID_COLS, SCROLL_DURATION_S } from "@/lib/constants";
import type { TileInfo } from "@/lib/types";

export type { TileInfo };

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

const MuralTile = memo(function MuralTile({
  src,
  origIdx,
  isHighlighted,
}: {
  src: string;
  origIdx: number;
  isHighlighted: boolean;
}) {
  return (
    <button
      data-index={origIdx}
      className={`group block p-[3px] bg-transparent cursor-pointer relative hover:z-10 ${isHighlighted ? "tile-highlighted" : ""
        }`}
      style={{ contain: "layout style paint" }}
      type="button"
    >
      <img
        src={src}
        alt=""
        className="w-full h-full object-cover rounded-[3px] block border border-white/4 opacity-90 transition-[transform,border-color] duration-200 ease-out group-hover:border-accent group-hover:scale-[1.03] group-hover:opacity-100"
        loading="eager"
        draggable={false}
      />
    </button>
  );
});

function seededShuffle(length: number, cols: number): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  let seed = 42;
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const remainder = indices.length % cols;
  if (remainder !== 0) {
    const pad = cols - remainder;
    const mid = Math.floor(indices.length / 2);
    for (let p = 0; p < pad; p++) {
      indices.push(indices[(mid + p) % length]);
    }
  }
  return indices;
}

function buildTiledGrid(
  shuffled: number[],
  cols: number,
  images: string[]
): { src: string; origIdx: number }[] {
  const rows = shuffled.length / cols;
  const result: { src: string; origIdx: number }[] = [];
  for (let by = 0; by < 2; by++) {
    for (let row = 0; row < rows; row++) {
      for (let bx = 0; bx < 2; bx++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const origIdx = shuffled[idx];
          result.push({ src: images[origIdx], origIdx });
        }
      }
    }
  }
  return result;
}

const PhotoMural = forwardRef<PhotoMuralHandle, PhotoMuralProps>(
  function PhotoMural(
    { images, isPaused, highlightedIndex, onImageClick },
    ref
  ) {
    const scrollLayerRef = useRef<HTMLDivElement>(null);

    const shuffledIndices = useMemo(
      () => seededShuffle(images.length, GRID_COLS),
      [images.length]
    );

    const tiledImages = useMemo(
      () => buildTiledGrid(shuffledIndices, GRID_COLS, images),
      [shuffledIndices, images]
    );

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        const button = (e.target as HTMLElement).closest<HTMLButtonElement>(
          "button[data-index]"
        );
        if (!button) return;
        const index = Number(button.dataset.index);
        if (!Number.isNaN(index)) onImageClick(index);
      },
      [onImageClick]
    );

    const getRandomVisibleIndex = useCallback((): number | null => {
      const layer = scrollLayerRef.current;
      if (!layer) return null;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const visible = new Set<number>();
      const tiles =
        layer.querySelectorAll<HTMLButtonElement>("button[data-index]");

      for (const tile of tiles) {
        const rect = tile.getBoundingClientRect();
        const cx = (rect.left + rect.right) / 2;
        const cy = (rect.top + rect.bottom) / 2;
        if (cx > 0 && cx < vw && cy > 0 && cy < vh) {
          visible.add(Number(tile.dataset.index));
        }
      }

      if (visible.size === 0) return null;
      const arr = Array.from(visible);
      return arr[Math.floor(Math.random() * arr.length)];
    }, []);

    const getTileInfo = useCallback(
      (origIdx: number): TileInfo | null => {
        const layer = scrollLayerRef.current;
        if (!layer) return null;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const tiles = layer.querySelectorAll<HTMLButtonElement>(
          `button[data-index="${origIdx}"]`
        );

        for (const tile of tiles) {
          const rect = tile.getBoundingClientRect();
          const cx = (rect.left + rect.right) / 2;
          const cy = (rect.top + rect.bottom) / 2;
          if (cx > 0 && cx < vw && cy > 0 && cy < vh) {
            const img = tile.querySelector("img");
            return {
              rect,
              naturalWidth: img?.naturalWidth ?? rect.width,
              naturalHeight: img?.naturalHeight ?? rect.height,
            };
          }
        }
        return null;
      },
      []
    );

    useImperativeHandle(
      ref,
      () => ({ getRandomVisibleIndex, getTileInfo }),
      [getRandomVisibleIndex, getTileInfo]
    );

    const isHighlighting = highlightedIndex !== null;

    return (
      <div
        className={`fixed inset-0 overflow-hidden bg-surface ${isHighlighting ? "z-20 mural-highlighting" : "z-0"
          }`}
      >
        <div
          ref={scrollLayerRef}
          className="grid will-change-transform"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS * 2}, var(--tile-w))`,
            gridAutoRows: "var(--tile-h)",
            animation: `mural-scroll ${SCROLL_DURATION_S}s linear infinite`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onClick={handleClick}
        >
          {tiledImages.map((tile, i) => (
            <MuralTile
              key={i}
              src={tile.src}
              origIdx={tile.origIdx}
              isHighlighted={
                isHighlighting && tile.origIdx === highlightedIndex
              }
            />
          ))}
        </div>
      </div>
    );
  }
);

export default PhotoMural;
