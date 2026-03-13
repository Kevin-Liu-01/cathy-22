interface MonoLabelProps {
  children: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export default function MonoLabel({
  children,
  accent,
  className = "",
}: MonoLabelProps) {
  return (
    <span
      className={`font-mono text-[0.65rem] tracking-[0.08em] uppercase whitespace-nowrap ${
        accent ? "text-accent" : "text-muted"
      } ${className}`}
    >
      {children}
    </span>
  );
}
