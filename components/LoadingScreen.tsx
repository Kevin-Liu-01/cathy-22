"use client";

import { useEffect, useState } from "react";
import { BIRTHDAY_NAME, BIRTHDAY_AGE, IMAGES } from "@/lib/constants";

interface LoadingScreenProps {
  progress: number;
  isComplete: boolean;
  onFinished: () => void;
}

export default function LoadingScreen({
  progress,
  isComplete,
  onFinished,
}: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);
  const [statusText, setStatusText] = useState("INITIALIZING");

  useEffect(() => {
    if (progress < 0.3) setStatusText("INITIALIZING");
    else if (progress < 0.6) setStatusText("LOADING ASSETS");
    else if (progress < 0.9) setStatusText("PROCESSING");
    else if (progress < 1) setStatusText("FINALIZING");
    else setStatusText("READY");
  }, [progress]);

  useEffect(() => {
    if (!isComplete) return;
    const t = setTimeout(() => setFadeOut(true), 500);
    return () => clearTimeout(t);
  }, [isComplete]);

  useEffect(() => {
    if (!fadeOut) return;
    const t = setTimeout(onFinished, 800);
    return () => clearTimeout(t);
  }, [fadeOut, onFinished]);

  const pct = Math.round(progress * 100);
  const loaded = Math.round(progress * IMAGES.length);

  return (
    <div className={`loading-screen ${fadeOut ? "loading-screen--fade-out" : ""}`}>
      <div className="loading-grid-bg" />

      <div className="corner-mark corner-mark--tl" />
      <div className="corner-mark corner-mark--tr" />
      <div className="corner-mark corner-mark--bl" />
      <div className="corner-mark corner-mark--br" />

      <div className="loading-content">
        <div className="loading-top-label">
          <span className="mono-label">SYSTEM BOOT SEQUENCE</span>
          <span className="mono-label">v1.0</span>
        </div>

        <div className="loading-dashed-line" />

        <div className="loading-hero">
          <p className="loading-hero-sub">HAPPY {BIRTHDAY_AGE}ND</p>
          <h1 className="loading-hero-title">BIRTHDAY</h1>
          <h2 className="loading-hero-name">{BIRTHDAY_NAME.toUpperCase()}</h2>
        </div>

        <div className="loading-dashed-line" />

        <div className="loading-progress-section">
          <div className="loading-bar">
            <div className="loading-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="loading-progress-info">
            <span className="mono-label">[ {statusText} ]</span>
            <span className="mono-label mono-label--accent">{pct}%</span>
          </div>
        </div>

        <div className="loading-status-bar">
          <span className="mono-label">STATUS: {isComplete ? "READY" : "ACTIVE"}</span>
          <span className="mono-label">&gt;</span>
          <span className="mono-label">ASSETS: {loaded} / {IMAGES.length}</span>
          <span className="mono-label">&gt;</span>
          <span className="mono-label">UNIT: {BIRTHDAY_AGE}</span>
        </div>
      </div>

      <div className="loading-scan-line" />
    </div>
  );
}
