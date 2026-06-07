// PencilClassic — bold, flat geometric pencil at 45°.
// Terracotta body, ink ferrule + tip, soft eraser cap.
// Saul Bass simplicity — reads cleanly at 16px.
export function PencilClassic({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Eraser cap — soft warm pink */}
      <polygon
        points="22,6 24,4 28,8 26,10"
        fill="hsl(14,45%,76%)"
      />
      {/* Ferrule — ink band between eraser and body */}
      <polygon
        points="20,8 22,6 26,10 24,12"
        fill="hsl(218,35%,18%)"
      />
      {/* Body — terracotta */}
      <polygon
        points="6,23 20,8 24,12 10,27"
        fill="hsl(14,65%,52%)"
      />
      {/* Tip — ink triangle */}
      <polygon
        points="6,23 10,27 4,28"
        fill="hsl(218,35%,18%)"
      />
    </svg>
  );
}
