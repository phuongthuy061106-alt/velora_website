import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ROOMS, type Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import { formatVND } from "@/lib/pricing";
import s from "./rooms.module.css";

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: dict(lang).rooms.title };
}

export default async function Rooms({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = dict(lang);
  return (
    <div className="page-top">
      <header className="wrap">
        <h1 className="display h1" data-reveal="text">
          {t.rooms.title}
        </h1>
        <p className={`lead ${s.intro}`} data-reveal="text">
          {t.rooms.intro}
        </p>
      </header>

      <ol className={`wrap ${s.list}`}>
        {ROOMS.map((r) => (
          <li key={r.id} className={s.row}>
            <Link href={`/${lang}/rooms/${r.id}`} className={`media ${s.media}`} data-reveal="img" tabIndex={-1}>
              <Image src={r.image} alt={r.name} fill sizes="(max-width: 900px) 100vw, 58vw" placeholder="blur" />
            </Link>
            <div className={s.body} data-reveal="text">
              <h2 className="display h2">
                <Link href={`/${lang}/rooms/${r.id}`} className={s.titleLink}>
                  {r.name}
                </Link>
              </h2>
              <p className="muted">{r.summary[lang]}</p>
              <dl className={s.specs}>
                <div>
                  <dt>{t.rooms.area}</dt>
                  <dd>{r.area} m²</dd>
                </div>
                <div>
                  <dt>{t.rooms.capacity}</dt>
                  <dd>{t.rooms.capacityText(r.maxAdults, r.maxChildren, r.childAgeLimit)}</dd>
                </div>
                <div>
                  <dt>{t.rooms.beds}</dt>
                  <dd>{r.beds[lang]}</dd>
                </div>
                <div>
                  <dt>{t.rooms.price}</dt>
                  <dd className="num">{formatVND(r.pricePerNight, lang)}</dd>
                </div>
              </dl>
              <div className={s.actions}>
                <Link href={`/${lang}/book?room=${r.id}`} className="btn btn--book">
                  {t.rooms.bookThis}
                </Link>
                <Link href={`/${lang}/rooms/${r.id}`} className="btn btn--ghost">
                  {t.rooms.details}
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className={`wrap small muted ${s.note}`}>{t.rooms.priceNote}</p>
    </div>
  );
}
