// Decorative low-poly mountain with a flag at the summit, echoing the
// Enparadigm brand artwork.

const P: [number, number][] = [
  [420, 40], [360, 120], [470, 110], [300, 200], [400, 190], [530, 180],
  [220, 280], [340, 290], [460, 280], [590, 260], [120, 400], [260, 400],
  [400, 400], [520, 400], [600, 400], [600, 140],
];

const FILLS = {
  yellow: "#fdde33",
  paleYellow: "#fee98a",
  amber: "#fbb52e",
  orange: "#fc9c38",
  coral: "#f83a4f",
  red: "#e8323f",
  crimson: "#d01b30",
};

const TRIANGLES: [number, number, number, keyof typeof FILLS][] = [
  [0, 1, 2, "yellow"], [1, 3, 4, "amber"], [1, 4, 2, "paleYellow"],
  [2, 4, 5, "coral"], [2, 5, 15, "crimson"], [5, 15, 9, "red"],
  [3, 6, 7, "coral"], [3, 7, 4, "amber"], [4, 7, 8, "yellow"],
  [4, 8, 5, "orange"], [5, 8, 9, "coral"], [6, 10, 11, "crimson"],
  [6, 11, 7, "red"], [7, 11, 12, "amber"], [7, 12, 8, "orange"],
  [8, 12, 13, "crimson"], [8, 13, 9, "coral"], [9, 13, 14, "orange"],
];

export default function LowPoly({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="100 -40 500 440" aria-hidden="true">
      {TRIANGLES.map(([a, b, c, fill], i) => (
        <polygon
          key={i}
          points={[P[a], P[b], P[c]].map((p) => p.join(",")).join(" ")}
          fill={FILLS[fill]}
          stroke="#fff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      ))}
      {P.filter(([x, y]) => y < 400 && x < 600).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill="#fff" />
      ))}
      <line x1="420" y1="40" x2="420" y2="-30" stroke="#fdde33" strokeWidth="3" />
      <polygon points="420,-30 462,-24 452,-12 466,0 420,-4" fill="#fdde33" />
      <polygon points="440,-26 462,-24 452,-12 466,0 444,-3" fill="#fc9c38" />
    </svg>
  );
}
