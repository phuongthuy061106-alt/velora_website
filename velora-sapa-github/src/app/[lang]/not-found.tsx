import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-top wrap" style={{ paddingBottom: 160 }}>
      <h1 className="display h1">Không tìm thấy trang</h1>
      <p className="lead" style={{ margin: "16px 0 32px" }}>
        Page not found.
      </p>
      <Link href="/vi" className="btn btn--book">
        Về trang chủ
      </Link>
    </div>
  );
}
