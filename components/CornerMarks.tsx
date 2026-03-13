interface CornerMarksProps {
  offset?: boolean;
  markerClass?: string;
}

const BASE = "absolute border-accent pointer-events-none z-[2] w-3 h-3 md:w-[18px] md:h-[18px]";

export default function CornerMarks({
  offset = true,
  markerClass = "",
}: CornerMarksProps) {
  const tl = offset
    ? "top-2.5 left-2.5 md:top-4 md:left-4"
    : "top-0 left-0";
  const tr = offset
    ? "top-2.5 right-2.5 md:top-4 md:right-4"
    : "top-0 right-0";
  const bl = offset
    ? "bottom-2.5 left-2.5 md:bottom-4 md:left-4"
    : "bottom-0 left-0";
  const br = offset
    ? "bottom-2.5 right-2.5 md:bottom-4 md:right-4"
    : "bottom-0 right-0";

  return (
    <>
      <div className={`${BASE} ${tl} border-t-2 border-l-2 ${markerClass}`} />
      <div className={`${BASE} ${tr} border-t-2 border-r-2 ${markerClass}`} />
      <div className={`${BASE} ${bl} border-b-2 border-l-2 ${markerClass}`} />
      <div className={`${BASE} ${br} border-b-2 border-r-2 ${markerClass}`} />
    </>
  );
}
