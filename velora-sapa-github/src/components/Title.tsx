// Tiêu đề kiểu "biên tập": phần trước dấu | viết hoa đứng, phần sau in nghiêng màu nhấn, xuống dòng riêng.
// VD "Ở lại|lâu hơn một chút" → Ở LẠI / *lâu hơn một chút*
type Props = {
  text: string;
  as?: "h1" | "h2" | "h3";
  size?: "h1" | "h2";
  id?: string;
  className?: string;
  reveal?: boolean;
};

export default function Title({ text, as: Tag = "h2", size = "h2", id, className = "", reveal = true }: Props) {
  const [main, accent] = text.split("|");
  return (
    <Tag id={id} className={`display caps ${size} ${className}`} data-reveal={reveal ? "text" : undefined}>
      <span className="caps-main">{main}</span>
      {accent && <em className="accent">{accent}</em>}
    </Tag>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`eyebrow ${className}`} data-reveal="text">
      {children}
    </p>
  );
}
