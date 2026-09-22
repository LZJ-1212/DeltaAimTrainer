type DeltaMarkProps = {
  className?: string;
};

export function DeltaMark({ className }: DeltaMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 28"
      width="28"
      height="24"
      aria-hidden
    >
      <path
        d="M16 2.5 L30 25.5 H2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
