// Mỗi lần chuyển trang, nội dung mới hiện lên nhẹ nhàng.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route">{children}</div>;
}
