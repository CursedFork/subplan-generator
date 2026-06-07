// PencilStamped — letterpress / rubber-stamp aesthetic.
// The terracotta pencil fill sits inside a slightly offset ink outline,
// giving the impression of a worn registration mismatch — old textbook feel.
export function PencilStamped({ size = 32 }: { size?: number }) {
  const OFFSET = 1.5;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Offset ink outline layer — shifted down-right */}
      <g transform={`translate(${OFFSET}, ${OFFSET})`}>
        <polygon
          points="6,23 20,8 24,12 10,27"
          stroke="hsl(218,35%,18%)"
          strokeWidth="1"
          fill="none"
          strokeLinejoin="round"
        />
        <polygon
          points="6,23 10,27 4,28"
          stroke="hsl(218,35%,18%)"
          strokeWidth="1"
          fill="none"
          strokeLinejoin="round"
        />
      </g>

      {/* Eraser cap */}
      <polygon
        points="22,6 24,4 28,8 26,10"
        fill="hsl(14,45%,76%)"
      />
      {/* Ferrule */}
      <polygon
        points="20,8 22,6 26,10 24,12"
        fill="hsl(218,35%,18%)"
      />
      {/* Body — terracotta fill */}
      <polygon
        points="6,23 20,8 24,12 10,27"
        fill="hsl(14,65%,52%)"
      />
      {/* Tip */}
      <polygon
        points="6,23 10,27 4,28"
        fill="hsl(218,35%,18%)"
      />
    </svg>
  );
}
