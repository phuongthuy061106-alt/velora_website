import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ROOMS, roomById, type Lang } from "@/lib/hotel";
import { dict, LANGS } from "@/lib/i18n";
import { formatVND } from "@/lib/pricing";
import StaySearch from "@/components/StaySearch";
import s from "./room.module.css";

type P = { params: Promise<{ lang: Lang; slug: string }> };

export const generateStaticParams = () => LANGS.flatMap((lang) => ROOMS.map((r) => ({ lang, slug: r.id })));

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const r = roomById(slug);
  return r ? { title: r.name, description: r.summary[lang] } : {};
}

export default async function RoomPage({ params }: P) {
  const { lang, slug } = await params;
  const r = roomById(slug);
  if (!r) notFound();
  const t = dict(lang);
  const others = ROOMS.filter((x) => x.id !== r.id);

  return (
    <>
      <section className={s.hero} aria-labelledby="room-title">
        <div className={s.heroMedia} data-parallax="0.18">
          <Image src={r.image} alt="" fill priority sizes="100vw" placeholder="blur" />
        </div>
        <div className={s.shade} aria-hidden />
        <div className={`wrap ${s.heroInner}`}>
          <p className={s.crumb}>
            <Link href={`/${lang}/rooms`}>{t.rooms.title}</Link>
          </p>
          <h1 id="room-title" className={`display h1 ${s.title}`}>
            {r.name}
          </h1>
          <p className={s.heroMeta}>
            {r.area} m², {t.rooms.capacityText(r.maxAdults, r.maxChildren, r.childAgeLimit).toLowerCase()}
          </p>
        </div>
      </section>

      <section className="section">
        <div className={`wrap ${s.grid}`}>
          <div className={s.main}>
            <p className={`display ${s.summary}`} data-reveal="text">
              {r.summary[lang]}
            </p>
            <div className={s.cols}>
              <div data-reveal="text">
                <h2 className={s.h}>{t.rooms.amenities}</h2>
                <ul className={s.amen}>
                  {r.amenities.map((a) => (
                    <li key={a.en}>{a[lang]}</li>
                  ))}
                </ul>
              </div>
              <dl className={s.specs} data-reveal="text">
                <div>
                  <dt>{t.rooms.area}</dt>
                  <dd>{r.area} m²</dd>
                </div>
                <div>
                  <dt>{t.rooms.beds}</dt>
                  <dd>{r.beds[lang]}</dd>
                </div>
                <div>
                  <dt>{t.rooms.capacity}</dt>
                  <dd>{t.rooms.capacityText(r.maxAdults, r.maxChildren, r.childAgeLimit)}</dd>
                </div>
                <div>
                  <dt>{t.book.extraBed}</dt>
                  <dd>{t.rooms.extraBedNote}</dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className={s.aside} aria-label={t.rooms.bookThis}>
            <div className={s.card}>
              <p className={s.priceLabel}>{t.rooms.price}</p>
              <p className={`display num ${s.price}`}>{formatVND(r.pricePerNight, lang)}</p>
              <p className="small muted">{t.rooms.priceNote}</p>
              <StaySearch lang={lang} room={r.id} />
            </div>
          </aside>
        </div>
      </section>

      <section className={`section dark ${s.others}`} aria-labelledby="others-title">
        <div className="wrap">
          <h2 id="others-title" className="display h2" data-reveal="text">
            {t.rooms.otherRooms}
          </h2>
          <ul className={s.otherList}>
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/${lang}/rooms/${o.id}`} className={s.otherLink}>
                  <div className="media" data-reveal="img" style={{ aspectRatio: "4 / 3", background: "#2a352c" }}>
                    <Image src={o.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" placeholder="blur" />
                  </div>
                  <span className="h3">{o.name}</span>
                  <span className="muted small num">
                    {formatVND(o.pricePerNight, lang)} {t.home.perNight}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
