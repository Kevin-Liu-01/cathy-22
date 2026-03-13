"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IMAGES,
  BIRTHDAY_AGE,
  SPOTLIGHT_INTERVAL_MS,
  AUTO_SPOTLIGHT_DURATION_MS,
  HIGHLIGHT_DURATION_MS,
  ZOOM_TO_CENTER_MS,
} from "@/lib/constants";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import LoadingScreen from "@/components/LoadingScreen";
import PhotoMural, { type PhotoMuralHandle } from "@/components/PhotoMural";
import PhotoModal from "@/components/PhotoModal";

interface FlyingImage {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  endX: number;
  endY: number;
  endW: number;
  endH: number;
}

export default function Home() {
  const muralRef = useRef<PhotoMuralHandle>(null);
  const { progress, isComplete } = useImagePreloader(IMAGES);
  const [isReady, setIsReady] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [isAutoHighlight, setIsAutoHighlight] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const [flyingImage, setFlyingImage] = useState<FlyingImage | null>(null);
  const [flyToCenter, setFlyToCenter] = useState(false);
  const [flyFading, setFlyFading] = useState(false);

  const handleLoadingFinished = useCallback(() => {
    setIsReady(true);
  }, []);

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

      const { rect, naturalWidth, naturalHeight } = info;
      const ratio = naturalWidth / naturalHeight;
      const h = rect.height;
      const w = h * ratio;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const chromePadX = 200;
      const chromePadY = 300;
      const maxW = vw - chromePadX;
      const maxH = vh - chromePadY;
      let endW: number, endH: number;
      if (ratio > maxW / maxH) {
        endW = maxW;
        endH = maxW / ratio;
      } else {
        endH = maxH;
        endW = maxH * ratio;
      }
      const endX = (vw - endW) / 2;
      const endY = (vh - endH) / 2;

      setFlyingImage({
        src: IMAGES[highlightedIndex],
        x: rect.x + (rect.width - w) / 2,
        y: rect.y,
        w,
        h,
        endX,
        endY,
        endW,
        endH,
      });

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setFlyToCenter(true));
      });

      zoomTimer = setTimeout(() => {
        setSelectedIndex(highlightedIndex);
        setIsAutoMode(isAutoHighlight);
        setHighlightedIndex(null);
        setIsAutoHighlight(false);

        chromeTimer = setTimeout(() => {
          setFlyFading(true);
          cleanTimer = setTimeout(() => {
            setFlyingImage(null);
            setFlyToCenter(false);
            setFlyFading(false);
          }, 300);
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
      setFlyingImage(null);
      setFlyToCenter(false);
      setFlyFading(false);
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
          setFlyingImage(null);
          setFlyToCenter(false);
          setFlyFading(false);
          break;
        case "ArrowLeft":
          setSelectedIndex(
            (i) => ((i ?? 0) - 1 + IMAGES.length) % IMAGES.length
          );
          setIsAutoMode(false);
          setFlyingImage(null);
          setFlyToCenter(false);
          setFlyFading(false);
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedIndex]);

  const isModalOpen = selectedIndex !== null;
  const imageSrc = selectedIndex !== null ? IMAGES[selectedIndex] : null;

  function handleImageClick(index: number) {
    setHighlightedIndex(index);
    setIsAutoHighlight(false);
  }

  function handleCloseModal() {
    setSelectedIndex(null);
    setHighlightedIndex(null);
    setIsAutoMode(false);
    setFlyingImage(null);
    setFlyToCenter(false);
    setFlyFading(false);
  }

  function handlePrev() {
    setSelectedIndex((i) => ((i ?? 0) - 1 + IMAGES.length) % IMAGES.length);
    setIsAutoMode(false);
    setFlyingImage(null);
    setFlyToCenter(false);
    setFlyFading(false);
  }

  function handleNext() {
    setSelectedIndex((i) => ((i ?? 0) + 1) % IMAGES.length);
    setIsAutoMode(false);
    setFlyingImage(null);
    setFlyToCenter(false);
    setFlyFading(false);
  }

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

      <div className="grid-overlay" />
      <div className="mural-vignette" />

      <div className={`hud-overlay ${isModalOpen || highlightedIndex !== null ? "hud-overlay--hidden" : ""}`}>
        <div className="corner-mark corner-mark--tl" />
        <div className="corner-mark corner-mark--tr" />
        <div className="corner-mark corner-mark--bl" />
        <div className="corner-mark corner-mark--br" />

        <div className="hud-top-row">
          <span className="mono-label">HAPPY BIRTHDAY FROM YOUR FRIENDS, DEDALUS, AND KEVIN LIU!</span>
          <span className="mono-label">03.12.2026</span>
        </div>

        <div className="birthday-header">
          <p className="birthday-pre">HAPPY {BIRTHDAY_AGE}ND BIRTHDAY</p>
          <h1 className="birthday-name">CATHY</h1>
        </div>

        <div className="hud-center-hint">
          <span className="mono-label">( click any photo )</span>
        </div>

        <div className="hud-bottom-row">
          <div className="hud-status-pill">
            <span className="hud-dot" />
            <span className="mono-label">ACTIVE</span>
          </div>
          <span className="mono-label">&gt;</span>
          <span className="mono-label">MEMORIES: {IMAGES.length}</span>
          <span className="mono-label">&gt;</span>
          <span className="mono-label">UNIT: {BIRTHDAY_AGE}</span>
          <span className="mono-label">&gt;</span>
          <span className="mono-label">03.12.2026</span>
        </div>
      </div>

      {flyingImage && (
        <div
          className={`zoom-flyout${flyToCenter ? " zoom-flyout--centered" : ""}${flyFading ? " zoom-flyout--fading" : ""}`}
          style={{
            left: flyingImage.endX,
            top: flyingImage.endY,
            width: flyingImage.endW,
            height: flyingImage.endH,
            transform: flyToCenter
              ? "translate3d(0,0,0) scale3d(1,1,1)"
              : `translate3d(${flyingImage.x - flyingImage.endX}px,${flyingImage.y - flyingImage.endY}px,0) scale3d(${flyingImage.w / flyingImage.endW},${flyingImage.h / flyingImage.endH},1)`,
          }}
        >
          <img src={flyingImage.src} alt="" draggable={false} />
        </div>
      )}

      <PhotoModal
        imageSrc={imageSrc}
        imageIndex={selectedIndex}
        totalImages={IMAGES.length}
        isOpen={isModalOpen}
        hideImage={flyingImage !== null && !flyFading}
        onClose={handleCloseModal}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
}
