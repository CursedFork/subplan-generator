// AppleEditorial — refined, magazine masthead feel.
// Subtle top indentation where stem meets, leaf as elegant comma-curve.
export function AppleEditorial({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Apple body with subtle top indentation */}
      <path
        d="M8 14C8 9.029 11.358 5.5 15.5 5.5C19.642 5.5 23 9.029 23 14C23 20.627 19.642 27.5 15.5 27.5C11.358 27.5 8 20.627 8 14Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Left shoulder lobe */}
      <path
        d="M15.5 5.5C15.5 5.5 13.5 3.5 11 4C9.5 4.5 9 6 10.5 7C12 8.5 14.5 7 15.5 5.5Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Right shoulder lobe */}
      <path
        d="M15.5 5.5C15.5 5.5 17.5 3.5 20 4C21.5 4.5 22 6 20.5 7C19 8.5 16.5 7 15.5 5.5Z"
        fill="hsl(14, 65%, 52%)"
      />
      {/* Thin stem — breaks frame slightly upward */}
      <path
        d="M15.5 5.5C15.5 5.5 15.5 3 16 1.5"
        stroke="hsl(218, 35%, 18%)"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Leaf as single elegant comma-curve */}
      <path
        d="M16 2.5C16.5 1.5 18.5 0.5 21 1.5C21 1.5 19.5 4 17 4.5C15.5 4.75 15.5 3.5 16 2.5Z"
        fill="hsl(218, 35%, 18%)"
      />
    </svg>
  );
}
