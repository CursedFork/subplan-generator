// AppleStamped — letterpress feel with registration mismatch.
// Terracotta apple body with 1px ink-blue outline offset 1.5px down-right.
export function AppleStamped({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Outline layer — offset 1.5px down-right (registration mismatch) */}
      <path
        d="M8.5 14.5C8.5 9.529 11.858 6 16 6C20.142 6 23.5 9.529 23.5 14.5C23.5 21.127 20.142 28 16 28C11.858 28 8.5 21.127 8.5 14.5Z"
        stroke="hsl(218, 35%, 18%)"
        strokeWidth="1"
        fill="none"
      />
      {/* Outline left lobe offset */}
      <path
        d="M16 6C16 6 14 4 11.5 4.5C10 5 9.5 6.5 11 7.5C12.5 9 15 7.5 16 6Z"
        stroke="hsl(218, 35%, 18%)"
        strokeWidth="1"
        fill="none"
      />
      {/* Outline right lobe offset */}
      <path
        d="M16 6C16 6 18 4 20.5 4.5C22 5 22.5 6.5 21 7.5C19.5 9 17 7.5 16 6Z"
        stroke="hsl(218, 35%, 18%)"
        strokeWidth="1"
        fill="none"
      />
      {/* Apple body fill — terracotta, slightly up-left from outline */}
      <path
        d="M7 13C7 8.029 10.358 4.5 14.5 4.5C18.642 4.5 22 8.029 22 13C22 19.627 18.642 26.5 14.5 26.5C10.358 26.5 7 19.627 7 13Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Left lobe fill */}
      <path
        d="M14.5 4.5C14.5 4.5 12.5 2.5 10 3C8.5 3.5 8 5 9.5 6C11 7.5 13.5 6 14.5 4.5Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Right lobe fill */}
      <path
        d="M14.5 4.5C14.5 4.5 16.5 2.5 19 3C20.5 3.5 21 5 19.5 6C18 7.5 15.5 6 14.5 4.5Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Stem */}
      <line
        x1="14.5"
        y1="4.5"
        x2="14.5"
        y2="2"
        stroke="hsl(218, 35%, 18%)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Leaf — ink blue */}
      <path
        d="M14.5 3C14.5 3 16.5 1.5 19 1C19 1 18.5 3.5 16 4.5C15 4.75 14.5 4 14.5 3Z"
        fill="hsl(218, 35%, 18%)"
      />
    </svg>
  );
}
