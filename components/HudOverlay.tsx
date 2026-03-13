import { BIRTHDAY_AGE, OPERATION_NAME, IMAGES } from "@/lib/constants";
import MonoLabel from "@/components/MonoLabel";
import CornerMarks from "@/components/CornerMarks";

interface HudOverlayProps {
  isHidden: boolean;
}

export default function HudOverlay({ isHidden }: HudOverlayProps) {
  return (
    <div
      className={`fixed inset-0 z-10 pointer-events-none flex flex-col items-center justify-center transition-opacity duration-400 ${isHidden ? "opacity-0" : ""
        }`}
    >
      <CornerMarks />

      {/* Top row */}
      <div className="absolute top-9 md:top-11 left-9 md:left-12 right-9 md:right-12 flex justify-between">
        <MonoLabel>
          <span className="md:hidden">HAPPY BIRTHDAY FROM KEVIN LIU</span>
          <span className="hidden md:inline">
            HAPPY BIRTHDAY FROM YOUR FRIENDS, DEDALUS, AND KEVIN LIU!
          </span>
        </MonoLabel>
        <MonoLabel>12 MAR 2026</MonoLabel>
      </div>

      {/* Birthday header */}
      <div className="text-center">
        <p
          className="font-sans text-[clamp(1rem,2.5vw,1.6rem)] font-light tracking-[0.3em] text-white/85 uppercase mb-[0.15em]"
          style={{
            textShadow:
              "0 2px 20px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6)",
          }}
        >
          HAPPY {BIRTHDAY_AGE}ND BIRTHDAY
        </p>
        <h1
          className="font-sans text-[clamp(3.5rem,20vw,8rem)] md:text-[clamp(5rem,18vw,14rem)] font-bold tracking-[-0.03em] leading-[0.85] text-accent uppercase"
          style={{
            textShadow:
              "0 0 80px rgba(201,168,76,0.4), 0 0 120px rgba(201,168,76,0.2), 0 4px 30px rgba(0,0,0,0.9)",
          }}
        >
          {OPERATION_NAME}
        </h1>
      </div>

      {/* Center hint */}
      <div className="mt-6 px-4 py-1.5 border border-dashed border-white/35">
        <MonoLabel className="text-white/70!">
          ( select any exhibit )
        </MonoLabel>
      </div>

      {/* Bottom row */}
      <div className="absolute bottom-9 md:bottom-11 left-9 md:left-12 right-9 md:right-12 flex items-center justify-center gap-2 md:gap-4 flex-wrap pt-3 border-t border-edge">
        <div className="flex items-center gap-1.5 px-2.5 py-1 border border-edge">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent"
            style={{ animation: "dot-pulse 2s ease-in-out infinite" }}
          />
          <MonoLabel>OPERATIVE</MonoLabel>
        </div>
        <MonoLabel>&gt;</MonoLabel>
        <MonoLabel>EXHIBITS: {IMAGES.length}</MonoLabel>
        <MonoLabel>&gt;</MonoLabel>
        <MonoLabel>SECTION: {BIRTHDAY_AGE}</MonoLabel>
        <MonoLabel>&gt;</MonoLabel>
        <MonoLabel>REF: CB-2026-0312</MonoLabel>
      </div>
    </div>
  );
}
