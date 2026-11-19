import { NextResponse, type NextRequest } from "next/server";

// Truy cập "/" hoặc đường dẫn chưa có ngôn ngữ: chuyển sang /vi hoặc /en theo trình duyệt.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (/^\/(vi|en)(\/|$)/.test(pathname)) return NextResponse.next();
  const accept = req.headers.get("accept-language") ?? "";
  const lang = /^\s*vi/i.test(accept) || !/^\s*en/i.test(accept) ? "vi" : "en";
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|icon|apple-icon|.*\\..*).*)"],
};
