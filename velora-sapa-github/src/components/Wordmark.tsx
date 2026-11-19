// Logo chữ Velora: tên viết hoa giãn chữ, đặt dưới đường nét núi Hoàng Liên Sơn.
export default function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className} style={{ display: "inline-grid", justifyItems: "center", gap: 3, lineHeight: 1 }}>
      <svg width="54" height="11" viewBox="0 0 54 11" fill="none" aria-hidden>
        <path
          d="M1 10 L12 4 L18 7 L27 1 L35 6 L41 4 L53 10"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "1.35rem",
          letterSpacing: "0.32em",
          marginRight: "-0.32em",
        }}
      >
        VELORA
      </span>
    </span>
  );
}
