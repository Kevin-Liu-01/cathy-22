import type { FlyoutState } from "@/lib/types";

interface ZoomFlyoutProps {
  flyout: FlyoutState;
}

export default function ZoomFlyout({ flyout }: ZoomFlyoutProps) {
  const { image, centered, fading } = flyout;

  return (
    <div
      className="fixed z-55 pointer-events-none overflow-hidden border-2 rounded origin-top-left will-change-transform"
      style={{
        left: image.endX,
        top: image.endY,
        width: image.endW,
        height: image.endH,
        borderColor: centered
          ? "var(--color-edge)"
          : "var(--color-accent)",
        boxShadow:
          "0 0 30px rgba(201,168,76,0.4), 0 0 80px rgba(201,168,76,0.15)",
        transform: centered
          ? "translate3d(0,0,0) scale3d(1,1,1)"
          : `translate3d(${image.x - image.endX}px,${image.y - image.endY}px,0) scale3d(${image.w / image.endW},${image.h / image.endH},1)`,
        transition: fading
          ? "opacity 0.3s ease"
          : "transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.55s ease",
        opacity: fading ? 0 : 1,
      }}
    >
      <img
        src={image.src}
        alt=""
        className="w-full h-full object-contain bg-surface block"
        draggable={false}
      />
    </div>
  );
}
