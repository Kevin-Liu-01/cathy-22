"use client";

import { useEffect, useState } from "react";

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
    if (e.target === e.currentTarget && e.propertyName === "opacity" && !isOpen) {
      setDisplaySrc(null);
      setDisplayIndex(null);
    }
  }

  const counter = displayIndex !== null
    ? `${String(displayIndex + 1).padStart(2, "0")} / ${String(totalImages).padStart(2, "0")}`
    : "";

  return (
    <div
      className={`photo-modal ${isOpen ? "photo-modal--open" : ""}`}
      onClick={onClose}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className="modal-frame" onClick={(e) => e.stopPropagation()}>
        <div className="corner-mark corner-mark--tl" />
        <div className="corner-mark corner-mark--tr" />
        <div className="corner-mark corner-mark--bl" />
        <div className="corner-mark corner-mark--br" />

        <div className="modal-top-bar">
          <span className="mono-label">MEMORY VIEWER</span>
          <span className="mono-label mono-label--accent">{counter}</span>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            &#10005; <span className="mono-label">CLOSE</span>
          </button>
        </div>

        <div className="modal-image-container">
          <button
            className="modal-nav modal-nav--prev"
            onClick={onPrev}
            aria-label="Previous photo"
            type="button"
          >
            &#8249;
          </button>

          {displaySrc && (
            <img
              src={displaySrc}
              alt=""
              className={`modal-image${hideImage ? " modal-image--hidden" : ""}`}
              draggable={false}
            />
          )}

          <button
            className="modal-nav modal-nav--next"
            onClick={onNext}
            aria-label="Next photo"
            type="button"
          >
            &#8250;
          </button>
        </div>

        <div className="modal-bottom-bar">
          <span className="mono-label">UNIT: CATHY</span>
          <span className="mono-label">&#9608;&#9608;&#9608;</span>
          <span className="mono-label">FIELD TESTED</span>
        </div>
      </div>
    </div>
  );
}
