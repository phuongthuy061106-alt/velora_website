import type { Metadata } from "next";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { BREAKFAST_GUESTS, LAUNDRY, OTHER_SERVICES, SPA, SURCHARGES, TOURS, TRANSFERS, type Lang, type PriceRow } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import PriceRows from "@/components/PriceRows";
import Title from "@/components/Title";
import breakfast from "@/assets/img/breakfast.jpg";
import restaurant from "@/assets/img/restaurant.jpg";
import spa from "@/assets/img/spa.jpg";
import pool from "@/assets/img/pool.jpg";
import waterwheel from "@/assets/img/waterwheel.jpg";
import transfer from "@/assets/img/transfer.jpg";
import laundry from "@/assets/img/laundry.jpg";
import s from "../content.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: dict(lang).services.title };
}

type Block = {
  id: string;
  title: string;
  note?: string;
  rows?: PriceRow[];
  body?: string;
  image?: StaticImageData;
  bookable?: boolean;
};

// Đủ các dịch vụ trong tài liệu "Thông tin". Dịch vụ tính phí ở trên, dịch vụ miễn phí gom thành mục riêng gần cuối.
export default async function Services({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = dict(lang).services;

  const paid: Block[] = [
    { id: "restaurant", title: t.restaurant, body: t.restaurantBody, note: t.restaurantNote, image: restaurant },
    { id: "spa", title: t.spa, note: t.spaNote, rows: SPA, image: spa, bookable: true },
    { id: "transfer", title: t.transfer, note: t.transferNote, rows: TRANSFERS, image: transfer, bookable: true },
    { id: "tours", title: t.tours, rows: TOURS, image: waterwheel, bookable: true },
    { id: "laundry", title: t.laundry, note: t.laundryNote, rows: LAUNDRY, image: laundry, bookable: true },
    { id: "early-late", title: t.earlyLate, note: t.earlyLateNote, rows: SURCHARGES.slice(4), bookable: true },
  ];

  const free = [
    { id: "breakfast", title: t.breakfast, body: t.breakfastBody, image: breakfast, extra: true },
    { id: "pool", title: t.pool, body: t.poolBody, image: pool },
    { id: "gym", title: t.gym, body: t.gymBody },
    { id: "luggage", title: t.luggage, body: t.luggageBody },
  ];

  const index = [...paid.map((b) => ({ id: b.id, title: b.title })), { id: "free", title: t.freeTitle }, { id: "other", title: t.otherTitle }];

  return (
    <div className="page-top">
      <header className="wrap">
        <Title as="h1" size="h1" text={t.title} />
        <p className={`lead ${s.intro}`} data-reveal="text">
          {t.intro}
        </p>
        <p className={`small muted ${s.intro}`}>{t.paidAtHotel}</p>
        <nav className={s.index} aria-label={t.index}>
          {index.map((b) => (
            <a key={b.id} href={`#${b.id}`}>
              {b.title}
            </a>
          ))}
        </nav>
      </header>

      {/* Dịch vụ tính phí */}
      <div className={`wrap ${s.policy}`}>
        {paid.map((b) => (
          <section key={b.id} id={b.id} className={`${s.twoCol} ${s.svcBlock}`} aria-labelledby={`${b.id}-t`}>
            <div className={s.svcHead}>
              <h2 id={`${b.id}-t`} className="display h2" data-reveal="text">
                {b.title}
              </h2>
              {b.note && <p className="muted">{b.note}</p>}
              {b.image && (
                <div className={`media ${s.svcImg}`} data-reveal="img">
                  <Image src={b.image} alt="" fill sizes="(max-width: 900px) 100vw, 40vw" placeholder="blur" />
                </div>
              )}
            </div>
            <div data-reveal="text">
              {b.body && <p className="lead">{b.body}</p>}
              {b.rows && <PriceRows rows={b.rows} lang={lang} />}
              {b.bookable && (
                <Link href={`/${lang}/book`} className={`btn btn--ghost ${s.svcCta}`}>
                  {t.bookCta}
                </Link>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Miễn phí cho khách lưu trú: mục riêng, gần cuối trang */}
      <section id="free" className={`section dark ${s.freeBand}`} aria-labelledby="free-t">
        <div className="wrap">
          <h2 id="free-t" className="display h2" data-reveal="text">
            {t.freeTitle}
          </h2>
          <p className="muted" data-reveal="text">
            {t.freeIntro}
          </p>
          <ul className={s.freeGrid}>
            {free.map((f) => (
              <li key={f.id} id={f.id} className={s.freeItem} data-reveal="text">
                {f.image && (
                  <div className={`media ${s.freeImg}`}>
                    <Image src={f.image} alt="" fill sizes="(max-width: 900px) 100vw, 25vw" placeholder="blur" />
                  </div>
                )}
                <h3 className="h3">{f.title}</h3>
                <p className="muted">{f.body}</p>
                {f.extra && (
                  <div className={s.freeExtra}>
                    <p className="small">{t.breakfastGuests}:</p>
                    <PriceRows rows={BREAKFAST_GUESTS} lang={lang} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Dịch vụ khác: liên hệ lễ tân */}
      <section id="other" className={`section wrap ${s.twoCol}`} aria-labelledby="other-t">
        <h2 id="other-t" className="display h2" data-reveal="text">
          {t.otherTitle}
        </h2>
        <div data-reveal="text">
          <PriceRows rows={OTHER_SERVICES} lang={lang} />
        </div>
      </section>
    </div>
  );
}
