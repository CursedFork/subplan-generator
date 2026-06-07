// AppleClassic — geometric apple. Terracotta body, ink leaf + stem.
// Bold, flat. ~32px height, scalable.
export function AppleClassic({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Apple body — rounded terracotta */}
      <path
        d="M7 13C7 8.029 10.686 4 15.5 4C20.314 4 24 8.029 24 13C24 19.627 20.686 27 15.5 27C10.314 27 7 19.627 7 13Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Left lobe */}
      <path
        d="M15.5 4C15.5 4 13 2 10.5 3C9 3.5 8 5 9.5 6.5C11 8 13.5 6.5 15.5 4Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Right lobe */}
      <path
        d="M15.5 4C15.5 4 18 2 20.5 3C22 3.5 23 5 21.5 6.5C20 8 17.5 6.5 15.5 4Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Stem */}
      <line
        x1="15.5"
        y1="4"
        x2="15.5"
        y2="1.5"
        stroke="hsl(218, 35%, 18%)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      {/* Leaf — curves up-right at ~30° */}
      <path
        d="M15.5 3C15.5 3 17.5 1.5 20 1C20 1 19.5 3.5 17 4.5C16 5 15.5 4.5 15.5 3Z"
        fill="hsl(218, 35%, 18%)"
      />
    </svg>
  );
}
