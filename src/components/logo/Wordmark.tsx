// Wordmark — "Teacher's Pet" in Fraunces weight 600, optical size 96.
// Curly apostrophe, letter-spacing -0.01em, ink color.
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-display text-ink select-none ${className}`}
      style={{
        fontWeight: 600,
        fontVariationSettings: "'opsz' 96",
        letterSpacing: '-0.01em',
      }}
    >
      Teacher&#8217;s Pet
    </span>
  );
}
