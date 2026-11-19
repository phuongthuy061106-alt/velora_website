import type { Metadata } from "next";
import { Suspense } from "react";
import type { Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import BookingLookup from "@/components/BookingLookup";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: dict(lang).lookup.title };
}

export default async function LookupPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = dict(lang);
  return (
    <div className="page-top" style={{ paddingBottom: "clamp(72px, 10vw, 140px)" }}>
      <div className="wrap" style={{ maxWidth: 1100 }}>
        <h1 className="display h1" style={{ marginBottom: 16 }}>
          {t.lookup.title}
        </h1>
        <p className="muted" style={{ margin: "0 0 clamp(32px, 5vw, 56px)", maxWidth: "60ch" }}>
          {t.lookup.intro}
        </p>
        <Suspense>
          <BookingLookup lang={lang} />
        </Suspense>
      </div>
    </div>
  );
}
