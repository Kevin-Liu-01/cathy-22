"use client";

import { useEffect, useState } from "react";
import { BIRTHDAY_AGE, OPERATION_NAME, IMAGES } from "@/lib/constants";
import MonoLabel from "@/components/MonoLabel";
import CornerMarks from "@/components/CornerMarks";

interface LoadingScreenProps {
  progress: number;
  isComplete: boolean;
  onFinished: () => void;
}

function getStatusText(progress: number): string {
  if (progress < 0.25) return "DECRYPTING";
  if (progress < 0.5) return "CROSS-REFERENCING";
  if (progress < 0.75) return "COMPILING INTEL";
  if (progress < 1) return "AUTHENTICATING";
  return "DECLASSIFIED";
}

export default function LoadingScreen({
  progress,
  isComplete,
  onFinished,
}: LoadingScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

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
  const statusText = getStatusText(progress);

  return (
    <div
      className={`fixed inset-0 z-100 flex items-center justify-center bg-surface transition-[opacity,transform] duration-700 ease-out ${
        fadeOut ? "opacity-0 scale-[1.02]" : ""
      }`}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <CornerMarks />

      <div className="relative z-1 flex flex-col items-center w-[min(480px,85vw)]">
        <div className="flex justify-between w-full mb-1">
          <MonoLabel>CLASSIFIED // DOSSIER RETRIEVAL</MonoLabel>
          <MonoLabel>FORM 22-B</MonoLabel>
        </div>

        <div className="w-full border-t border-dashed border-edge my-4" />

        <div className="text-center py-6">
          <p className="font-sans text-[clamp(0.8rem,2vw,1rem)] font-light tracking-[0.35em] text-muted uppercase mb-1">
            HAPPY {BIRTHDAY_AGE}ND BIRTHDAY
          </p>
          <h1 className="font-sans text-[clamp(2.5rem,12vw,4rem)] md:text-[clamp(3rem,10vw,5.5rem)] font-bold tracking-tight leading-[0.9] text-white uppercase">
            OPERATION
          </h1>
          <h2 className="font-sans text-[clamp(3rem,14vw,5rem)] md:text-[clamp(3.5rem,12vw,7rem)] font-bold tracking-tighter leading-[0.9] text-accent uppercase mt-[0.1em]">
            {OPERATION_NAME}
          </h2>
        </div>

        <div className="w-full border-t border-dashed border-edge my-4" />

        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-[3px] bg-edge overflow-hidden">
            <div
              className="h-full bg-accent transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between w-full">
            <MonoLabel>[ {statusText} ]</MonoLabel>
            <MonoLabel accent>{pct}%</MonoLabel>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-edge w-full justify-center">
          <MonoLabel>
            CLEARANCE: {isComplete ? "GRANTED" : "PENDING"}
          </MonoLabel>
          <MonoLabel>&gt;</MonoLabel>
          <MonoLabel>
            EXHIBITS: {loaded} / {IMAGES.length}
          </MonoLabel>
          <MonoLabel>&gt;</MonoLabel>
          <MonoLabel>SECTION: {BIRTHDAY_AGE}</MonoLabel>
        </div>
      </div>

      {/* Scan line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
          animation: "scan-move 3s linear infinite",
        }}
      />
    </div>
  );
}
