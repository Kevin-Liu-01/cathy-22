"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IMAGES,
  SPOTLIGHT_INTERVAL_MS,
  AUTO_SPOTLIGHT_DURATION_MS,
  HIGHLIGHT_DURATION_MS,
  ZOOM_TO_CENTER_MS,
} from "@/lib/constants";
import type { FlyingImage, FlyoutState } from "@/lib/types";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import LoadingScreen from "@/components/LoadingScreen";
import PhotoMural, { type PhotoMuralHandle } from "@/components/PhotoMural";
import PhotoModal from "@/components/PhotoModal";
import HudOverlay from "@/components/HudOverlay";
import ZoomFlyout from "@/components/ZoomFlyout";

function computeFlyout(
  highlightedIndex: number,
  rect: DOMRect,
  naturalWidth: number,
  naturalHeight: number
): FlyingImage {
  const ratio = naturalWidth / naturalHeight;
  const h = rect.height;
  const w = h * ratio;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = vw - 200;
  const maxH = vh - 300;
  let endW: number, endH: number;
  if (ratio > maxW / maxH) {
    endW = maxW;
    endH = maxW / ratio;
  } else {
    endH = maxH;
    endW = maxH * ratio;
  }

  return {
    src: IMAGES[highlightedIndex],
    x: rect.x + (rect.width - w) / 2,
    y: rect.y,
    w,
    h,
    endX: (vw - endW) / 2,
    endY: (vh - endH) / 2,
    endW,
    endH,
  };
}

export default function Home() {
  const muralRef = useRef<PhotoMuralHandle>(null);
  const { progress, isComplete } = useImagePreloader(IMAGES);
  const [isReady, setIsReady] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isAutoHighlight, setIsAutoHighlight] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [flyout, setFlyout] = useState<FlyoutState | null>(null);

  const handleLoadingFinished = useCallback(() => setIsReady(true), []);

  useEffect(() => {
    if (!isReady || selectedIndex !== null || highlightedIndex !== null) return;

    const timer = setInterval(() => {
      const idx = muralRef.current?.getRandomVisibleIndex() ?? null;
      if (idx === null) return;
      setHighlightedIndex(idx);
      setIsAutoHighlight(true);
    }, SPOTLIGHT_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isReady, selectedIndex, highlightedIndex]);

  useEffect(() => {
    if (highlightedIndex === null) return;

    let zoomTimer: ReturnType<typeof setTimeout>;
    let chromeTimer: ReturnType<typeof setTimeout>;
    let cleanTimer: ReturnType<typeof setTimeout>;
    let raf1: number;
    let raf2: number;

    const highlightTimer = setTimeout(() => {
      const info = muralRef.current?.getTileInfo(highlightedIndex);

      if (!info) {
        setSelectedIndex(highlightedIndex);
        setIsAutoMode(isAutoHighlight);
        setHighlightedIndex(null);
        setIsAutoHighlight(false);
        return;
      }

      const flyingImage = computeFlyout(
        highlightedIndex,
        info.rect,
        info.naturalWidth,
        info.naturalHeight
      );

      setFlyout({ image: flyingImage, centered: false, fading: false });

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          setFlyout((prev) =>
            prev ? { ...prev, centered: true } : null
          );
        });
      });

      zoomTimer = setTimeout(() => {
        setSelectedIndex(highlightedIndex);
        setIsAutoMode(isAutoHighlight);
        setHighlightedIndex(null);
        setIsAutoHighlight(false);

        chromeTimer = setTimeout(() => {
          setFlyout((prev) =>
            prev ? { ...prev, fading: true } : null
          );
          cleanTimer = setTimeout(() => setFlyout(null), 300);
        }, 450);
      }, ZOOM_TO_CENTER_MS);
    }, HIGHLIGHT_DURATION_MS);

    return () => {
      clearTimeout(highlightTimer);
      clearTimeout(zoomTimer);
      clearTimeout(chromeTimer);
      clearTimeout(cleanTimer);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [highlightedIndex, isAutoHighlight]);

  useEffect(() => {
    if (selectedIndex === null || !isAutoMode) return;

    const timer = setTimeout(() => {
      setSelectedIndex(null);
      setIsAutoMode(false);
      setFlyout(null);
    }, AUTO_SPOTLIGHT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [selectedIndex, isAutoMode]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null) return;
      switch (e.key) {
        case "Escape":
          setSelectedIndex(null);
          setIsAutoMode(false);
          break;
        case "ArrowRight":
          setSelectedIndex((i) => ((i ?? 0) + 1) % IMAGES.length);
          setIsAutoMode(false);
          setFlyout(null);
          break;
        case "ArrowLeft":
          setSelectedIndex(
            (i) => ((i ?? 0) - 1 + IMAGES.length) % IMAGES.length
          );
          setIsAutoMode(false);
          setFlyout(null);
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex]);

  const isModalOpen = selectedIndex !== null;
  const imageSrc = selectedIndex !== null ? IMAGES[selectedIndex] : null;

  const handleImageClick = useCallback((index: number) => {
    setHighlightedIndex(index);
    setIsAutoHighlight(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedIndex(null);
    setHighlightedIndex(null);
    setIsAutoMode(false);
    setFlyout(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex(
      (i) => ((i ?? 0) - 1 + IMAGES.length) % IMAGES.length
    );
    setIsAutoMode(false);
    setFlyout(null);
  }, []);

  const handleNext = useCallback(() => {
    setSelectedIndex((i) => ((i ?? 0) + 1) % IMAGES.length);
    setIsAutoMode(false);
    setFlyout(null);
  }, []);

  return (
    <>
      {!isReady && (
        <LoadingScreen
          progress={progress}
          isComplete={isComplete}
          onFinished={handleLoadingFinished}
        />
      )}

      <PhotoMural
        ref={muralRef}
        images={IMAGES}
        isPaused={!isReady || isModalOpen || highlightedIndex !== null}
        highlightedIndex={highlightedIndex}
        onImageClick={handleImageClick}
      />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-4"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-5"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(10,12,8,0.25) 0%, rgba(10,12,8,0.55) 30%, rgba(10,12,8,0.85) 60%, rgba(10,12,8,0.97) 100%)",
        }}
      />

      <HudOverlay isHidden={isModalOpen || highlightedIndex !== null} />

      {flyout && <ZoomFlyout flyout={flyout} />}

      <PhotoModal
        imageSrc={imageSrc}
        imageIndex={selectedIndex}
        totalImages={IMAGES.length}
        isOpen={isModalOpen}
        hideImage={flyout !== null && !flyout.fading}
        onClose={handleCloseModal}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
}
