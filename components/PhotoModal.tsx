"use client";

import { useEffect, useState } from "react";
import MonoLabel from "@/components/MonoLabel";
import CornerMarks from "@/components/CornerMarks";

interface PhotoModalProps {
  imageSrc: string | null;
  imageIndex: number | null;
  totalImages: number;
  isOpen: boolean;
  hideImage?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function PhotoModal({
  imageSrc,
  imageIndex,
  totalImages,
  isOpen,
  hideImage = false,
  onClose,
  onPrev,
  onNext,
}: PhotoModalProps) {
  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [displayIndex, setDisplayIndex] = useState<number | null>(null);

  useEffect(() => {
    if (imageSrc) setDisplaySrc(imageSrc);
  }, [imageSrc]);

  useEffect(() => {
    if (imageIndex !== null) setDisplayIndex(imageIndex);
  }, [imageIndex]);

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (
      e.target === e.currentTarget &&
      e.propertyName === "opacity" &&
      !isOpen
    ) {
      setDisplaySrc(null);
      setDisplayIndex(null);
    }
  }

  const counter =
    displayIndex !== null
      ? `${String(displayIndex + 1).padStart(2, "0")} / ${String(totalImages).padStart(2, "0")}`
      : "";

  function getImageClass(): string {
    const base =
      "max-w-[calc(100vw-80px)] md:max-w-[calc(100vw-200px)] max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-300px)] object-contain border border-white/[0.06] rounded select-none will-change-[transform,opacity] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]";
    if (hideImage) return `${base} opacity-0 scale-100`;
    if (isOpen) return `${base} scale-100 opacity-100`;
    return `${base} scale-[0.98] opacity-0`;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-[background,opacity] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
        isOpen
          ? "bg-[rgba(10,12,8,0.97)] backdrop-blur-sm opacity-100 pointer-events-auto modal-open"
          : "bg-transparent opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
      onTransitionEnd={handleTransitionEnd}
    >
      <div
        className="relative flex flex-col w-[92vw] h-[92vh] p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <CornerMarks offset={false} markerClass="modal-corner" />

        <div className="modal-top-bar flex items-center gap-4 mb-3 pb-2 border-b border-edge">
          <MonoLabel className="flex-1">
            EXHIBIT VIEWER // CLASSIFIED
          </MonoLabel>
          <MonoLabel accent>{counter}</MonoLabel>
          <button
            className="flex items-center gap-1.5 text-muted text-xs bg-transparent border border-edge px-3 py-1 cursor-pointer transition-[color,border-color] duration-200 font-mono hover:text-white hover:border-accent"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            &#10005; <MonoLabel>CLOSE</MonoLabel>
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 min-h-0">
          <button
            className="modal-nav-prev text-muted text-2xl md:text-3xl leading-none bg-transparent border border-edge w-9 h-9 md:w-11 md:h-11 flex items-center justify-center cursor-pointer transition-[color,border-color,background] duration-200 shrink-0 hover:text-white hover:border-accent hover:bg-accent-dim"
            onClick={onPrev}
            aria-label="Previous photo"
            type="button"
          >
            &#8249;
          </button>

          <div className="flex-1 flex items-center justify-center min-w-0 min-h-0">
            {displaySrc && (
              <img
                src={displaySrc}
                alt=""
                className={getImageClass()}
                draggable={false}
              />
            )}
          </div>

          <button
            className="modal-nav-next text-muted text-2xl md:text-3xl leading-none bg-transparent border border-edge w-9 h-9 md:w-11 md:h-11 flex items-center justify-center cursor-pointer transition-[color,border-color,background] duration-200 shrink-0 hover:text-white hover:border-accent hover:bg-accent-dim"
            onClick={onNext}
            aria-label="Next photo"
            type="button"
          >
            &#8250;
          </button>
        </div>

        <div className="modal-bottom-bar flex items-center gap-4 mt-3 pt-2 border-t border-edge">
          <MonoLabel>SUBJECT: CATHY-22</MonoLabel>
          <MonoLabel>&#9608;&#9608;&#9608;</MonoLabel>
          <MonoLabel>DECLASSIFIED</MonoLabel>
        </div>
      </div>
    </div>
  );
}
