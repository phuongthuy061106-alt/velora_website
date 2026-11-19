// Mã QR MÔ PHỎNG: hoa văn vẽ từ chuỗi đầu vào, không chứa thông tin thanh toán thật và không quét được.
export default function MockQR({ seed, label }: { seed: string; label: string }) {
  const N = 25;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const finder = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < 7 && y < 7 ? !(x > 0 && x < 6 && y > 0 && y < 6) || (x > 1 && x < 5 && y > 1 && y < 5) : null;
  const cells: [number, number][] = [];
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const f = finder(x, y) ?? finder(N - 1 - x, y) ?? finder(x, N - 1 - y);
      const inZone = (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      if (f === true || (!inZone && rnd() > 0.52)) cells.push([x, y]);
    }
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} width="168" height="168" role="img" aria-label={label} style={{ background: "#fff", borderRadius: 8, flex: "none" }}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" fill="#1d2620" />
      ))}
    </svg>
  );
}
