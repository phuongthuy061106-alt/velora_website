import type { Metadata } from "next";
import {
  BOOKING_RULES,
  CANCELLATION,
  CHANGE_RULES,
  HOTEL,
  HOURS,
  HOUSE_RULES,
  NO_REFUND,
  REFUND_RULES,
  SURCHARGES,
  type Lang,
  type Text,
} from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import PriceRows from "@/components/PriceRows";
import s from "../content.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: dict(lang).info.title };
}

// Theo tài liệu "Thông tin", thẻ Tổng (giờ ăn sáng, hồ bơi, gym lấy từ thẻ FQA).
export default async function Info({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const d = dict(lang);
  const t = d.info;
  const hours = HOURS.map((h) => ({ name: h.label, price: h.value }));
  const surchargesKids = SURCHARGES.slice(0, 4);
  const earlyLate = SURCHARGES.slice(4);
  const bullets = (items: Text[], ordered = false) => {
    const L = ordered ? "ol" : "ul";
    return (
      <L className={`${s.bullets} ${ordered ? s.ordered : ""}`} data-reveal="text">
        {items.map((r) => (
          <li key={r.en}>{r[lang]}</li>
        ))}
      </L>
    );
  };

  return (
    <div className="page-top">
      <header className="wrap">
        <h1 className="display h1" data-reveal="text">
          {t.title}
        </h1>
      </header>

      <div className={`wrap ${s.policy}`}>
        <section className={s.twoCol} aria-labelledby="about">
          <h2 id="about" className="display h2" data-reveal="text">
            {t.about}
          </h2>
          <dl className={s.contact} data-reveal="text">
            {t.aboutRows.map(([k, v]) => (
              <div key={k} className={s.pair}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={s.twoCol} aria-labelledby="hours">
          <h2 id="hours" className="display h2" data-reveal="text">
            {t.hours}
          </h2>
          <div data-reveal="text">
            <PriceRows rows={hours} lang={lang} />
          </div>
        </section>

        <section className={s.twoCol} aria-labelledby="booking">
          <h2 id="booking" className="display h2" data-reveal="text">
            {t.booking}
          </h2>
          {bullets(BOOKING_RULES)}
        </section>

        <section className={s.twoCol} aria-labelledby="surcharges">
          <h2 id="surcharges" className="display h2" data-reveal="text">
            {t.surcharges}
          </h2>
          <div data-reveal="text">
            <PriceRows rows={surchargesKids} lang={lang} />
          </div>
        </section>

        <section className={s.twoCol} aria-labelledby="early">
          <h2 id="early" className="display h2" data-reveal="text">
            {t.early}
          </h2>
          <div data-reveal="text">
            <PriceRows rows={earlyLate} lang={lang} />
          </div>
        </section>

        <section className={s.twoCol} aria-labelledby="cancel">
          <h2 id="cancel" className="display h2" data-reveal="text">
            {t.cancellation}
          </h2>
          <div data-reveal="text">
            <p className={`small muted ${s.before}`}>{t.cancellationHead}</p>
            <PriceRows rows={CANCELLATION} lang={lang} />
            <h3 className={`h3 ${s.subhead}`}>{t.refund}</h3>
            <ul className={s.bullets}>
              {REFUND_RULES.map((r) => (
                <li key={r.en}>{r[lang]}</li>
              ))}
            </ul>
            <h3 className={`h3 ${s.subhead}`}>{t.noRefund}</h3>
            <ul className={s.bullets}>
              {NO_REFUND.map((r) => (
                <li key={r.en}>{r[lang]}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={s.twoCol} aria-labelledby="changes">
          <h2 id="changes" className="display h2" data-reveal="text">
            {t.changes}
          </h2>
          {bullets(CHANGE_RULES)}
        </section>

        <section className={s.twoCol} aria-labelledby="rules">
          <h2 id="rules" className="display h2" data-reveal="text">
            {t.rules}
          </h2>
          {bullets(HOUSE_RULES, true)}
        </section>

        <section className={s.twoCol} aria-labelledby="contact">
          <h2 id="contact" className="display h2" data-reveal="text">
            {t.contact}
          </h2>
          <dl className={s.contact} data-reveal="text">
            {[
              [d.footer.phone, <a key="p" href={`tel:${HOTEL.phone.replace(/\s/g, "")}`}>{HOTEL.phone}</a>],
              [d.footer.hotline, <a key="h" href={`tel:${HOTEL.hotline.replace(/\s/g, "")}`}>{HOTEL.hotline}</a>],
              [d.footer.email, <a key="e" href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>],
              [d.footer.address, HOTEL.address],
            ].map(([k, v]) => (
              <div key={String(k)} className={s.pair}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

      </div>
    </div>
  );
}
