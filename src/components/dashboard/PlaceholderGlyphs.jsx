export function BarsGlyph() {
  const heights = [34, 26, 40, 20, 30, 14, 24, 10, 22, 6, 18, 4, 12, 0];
  return (
    <svg viewBox="0 0 150 64" preserveAspectRatio="none" className="h-14 w-full" aria-hidden="true">
      {heights.map((y, i) => (
        <rect key={i} x={i * 11} y={y} width="6" height={64 - y} rx="1" fill="currentColor" opacity={0.22 + i * 0.03} />
      ))}
    </svg>
  );
}

export function LineGlyph() {
  return (
    <svg viewBox="0 0 200 96" className="h-14 w-full" aria-hidden="true">
      {[14, 44, 74].map((y) => (
        <line key={y} x1="4" y1={y} x2="196" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.12" />
      ))}
      <path
        d="M8,71.4 L38.7,66.1 L69.3,50.3 L100,55.6 L130.7,39.7 L161.3,29.1 L192,18.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
      />
      <circle cx="192" cy="18.6" r="3" fill="#64D2FF" />
    </svg>
  );
}