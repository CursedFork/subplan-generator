// PencilEditorial — a thinner, more refined pencil.
// Narrower body, subtle highlight edge, longer tapered tip.
// Magazine masthead feel — elegant, not chunky.
export function PencilEditorial({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Eraser cap — rounded ends, slightly narrower */}
      <polygon
        points="22.5,6.5 24.5,4.5 27.5,7.5 25.5,9.5"
        fill="hsl(14,45%,76%)"
      />
      {/* Ferrule — single-px thin band */}
      <polygon
        points="21,8 22.5,6.5 25.5,9.5 24,11"
        fill="hsl(218,35%,18%)"
      />
      {/* Body — terracotta, narrower */}
      <polygon
        points="7,24 21,8 24,11 10,27"
        fill="hsl(14,65%,52%)"
      />
      {/* Highlight edge — thin lighter line along top edge of body */}
      <line
        x1="7.5" y1="23.5" x2="21.5" y2="8.5"
        stroke="hsl(14,55%,68%)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      {/* Tip — longer, more tapered */}
      <polygon
        points="7,24 10,27 3,29"
        fill="hsl(218,35%,18%)"
      />
    </svg>
  );
}
