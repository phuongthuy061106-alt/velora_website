import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { dict, isLang, LANGS } from "@/lib/i18n";
import SmoothScroll from "@/components/SmoothScroll";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ChatWidget from "@/components/ChatWidget";
import CozeChat from "@/components/CozeChat";

// Tiêu đề: Cormorant Garamond (serif cổ điển, nét thanh). Nội dung: Be Vietnam Pro (do người Việt thiết kế, dấu chuẩn).
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const bevn = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-bevn",
  display: "swap",
});

export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = dict(lang);
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    description: t.meta.description,
    alternates: { languages: { vi: "/vi", en: "/en" } },
    openGraph: { title: t.meta.title, description: t.meta.description, locale: lang === "vi" ? "vi_VN" : "en_US" },
  };
}

export const viewport: Viewport = { themeColor: "#1d2620", width: "device-width", initialScale: 1 };

// Bật hiệu ứng xuất hiện chỉ khi có JS và người dùng không bật "giảm chuyển động".
const bootScript = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js')}catch(e){}`;

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = dict(lang);
  return (
    <html lang={lang} className={`${cormorant.variable} ${bevn.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a className="skip" href="#main">
          {t.nav.skip}
        </a>
        <SmoothScroll />
        <SiteHeader lang={lang} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} />
        <ChatWidget lang={lang} />
        <CozeChat />
      </body>
    </html>
  );
}
