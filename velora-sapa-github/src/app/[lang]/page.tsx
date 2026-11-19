import Image from "next/image";
import Link from "next/link";
import { ROOMS, type Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import { formatVND } from "@/lib/pricing";
import StaySearch from "@/components/StaySearch";
import Title, { Eyebrow } from "@/components/Title";
import hero from "@/assets/img/hero.jpg";
import spa from "@/assets/img/spa.jpg";
import breakfast from "@/assets/img/breakfast.jpg";
import pool from "@/assets/img/pool.jpg";
import terraces from "@/assets/img/waterwheel.jpg";
import storyImg from "@/assets/img/exterior.jpg";
import s from "./home.module.css";

export default async function Home({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const t = dict(lang);
  const h = t.home;
  const expImgs = [spa, breakfast, pool];

  return (
    <>
      {/* Hero: lớp sương tan dần để lộ khách sạn */}
      <section className={s.hero} aria-labelledby="hero-title">
        <div className={s.heroMedia} data-parallax="0.22">
          <Image src={hero} alt="" fill priority sizes="100vw" placeholder="blur" className={s.heroImg} />
        </div>
        <div className={s.shade} aria-hidden />
        <div className={s.mist} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className={`wrap ${s.heroInner}`}>
          <h1 id="hero-title" className={s.heroTitle}>
            <span className={s.word} aria-label="Velora">
              {"Velora".split("").map((c, i) => (
                <span key={i} aria-hidden style={{ "--i": i } as React.CSSProperties}>
                  {c}
                </span>
              ))}
            </span>
            <span className={s.heroLine}>{h.heroLine}</span>
          </h1>
          <p className={s.heroSub}>{h.heroSub}</p>
        </div>
        <a href="#intro" className={s.scroll}>
          <span>{h.scroll}</span>
          <span className={s.scrollLine} aria-hidden />
        </a>
      </section>

      {/* Giới thiệu */}
      <section id="intro" className={`section ${s.intro}`}>
        <div className={`wrap ${s.introGrid}`}>
          <div>
            <Eyebrow>{h.eyebrows.intro}</Eyebrow>
            <Title text={h.introTitle} />
          </div>
          <div className={s.introBody}>
            <p className="lead" data-reveal="text">
              {h.introBody}
            </p>
            <p className="quote" data-reveal="text">
              {h.quote}
            </p>
            <dl className={s.facts} data-reveal="text" style={{ "--d": "0.15s" } as React.CSSProperties}>
              {h.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd className="display">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Câu chuyện */}
      <section className={`section ${s.story}`} aria-labelledby="story-title">
        <div className={`wrap ${s.storyGrid}`}>
          <div className={`media ${s.storyMedia}`} data-reveal="img">
            <Image src={storyImg} alt="" fill sizes="(max-width: 900px) 100vw, 45vw" placeholder="blur" />
          </div>
          <div className={s.storyBody}>
            <Eyebrow>{h.story.eyebrow}</Eyebrow>
            <Title id="story-title" text={h.story.title} />
            {h.story.paras.map((p, i) => (
              <p key={i} className={i === 0 ? "lead" : undefined} data-reveal="text">
                {p}
              </p>
            ))}
            <Link href={`/${lang}/rooms`} className="btn btn--ghost" data-reveal="text">
              {h.story.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Phòng */}
      <section className={`section ${s.rooms}`} aria-labelledby="rooms-title">
        <div className="wrap">
          <div className={s.sectionHead}>
            <div>
              <Eyebrow>{h.eyebrows.rooms}</Eyebrow>
              <Title id="rooms-title" text={h.roomsTitle} />
            </div>
            <p className="muted" data-reveal="text">
              {h.roomsBody}
            </p>
          </div>
          <ul className={s.roomList}>
            {ROOMS.map((r, i) => (
              <li key={r.id} className={s.roomItem}>
                <Link href={`/${lang}/rooms/${r.id}`} className={s.roomLink}>
                  <div className={`media ${s.roomMedia}`} data-reveal="img" style={{ "--d": `${(i % 2) * 0.12}s` } as React.CSSProperties}>
                    <Image src={r.image} alt={r.name} fill sizes="(max-width: 760px) 100vw, 50vw" placeholder="blur" />
                  </div>
                  <div className={s.roomMeta} data-reveal="text">
                    <h3 className="h3">{r.name}</h3>
                    <p className="muted small">
                      {r.area} m², {r.beds[lang].toLowerCase()}
                    </p>
                    <p className={`num ${s.price}`}>
                      {h.from} {formatVND(r.pricePerNight, lang)} <span className="muted small">{h.perNight}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={`/${lang}/rooms`} className="btn btn--ghost">
            {h.allRooms}
          </Link>
        </div>
      </section>

      {/* Trải nghiệm */}
      <section className={`section dark ${s.exp}`} aria-labelledby="exp-title">
        <div className="wrap">
          <div className={s.expTitle}>
            <Eyebrow>{h.eyebrows.exp}</Eyebrow>
            <Title id="exp-title" text={h.expTitle} />
          </div>
          <div className={s.expGrid}>
            {h.exp.map((e, i) => (
              <article key={e.title} className={s.expItem}>
                <div className={`media ${s.expMedia}`} data-reveal="img">
                  <Image src={expImgs[i]} alt="" fill sizes="(max-width: 760px) 100vw, 40vw" placeholder="blur" />
                </div>
                <div data-reveal="text">
                  <h3 className="h3">{e.title}</h3>
                  <p className="muted">{e.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Thung lũng */}
      <section className={s.valley} aria-labelledby="valley-title">
        <div className={s.valleyMedia} data-parallax="0.14">
          <Image src={terraces} alt="" fill sizes="100vw" placeholder="blur" />
        </div>
        <div className={`wrap ${s.valleyInner}`}>
          <div className={s.valleyCard} data-reveal="text">
            <Eyebrow>{h.eyebrows.valley}</Eyebrow>
            <Title id="valley-title" text={h.valleyTitle} reveal={false} />
            <p>{h.valleyBody}</p>
            <Link href={`/${lang}/services#tours`} className="link">
              {h.valleyCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Đặt phòng */}
      <section className={`section dark ${s.book}`} aria-labelledby="book-title">
        <div className={`wrap ${s.bookGrid}`}>
          <div>
            <Eyebrow>{h.eyebrows.book}</Eyebrow>
            <Title id="book-title" text={h.bookTitle} />
            <p className="lead" data-reveal="text">
              {h.bookBody}
            </p>
          </div>
          <StaySearch lang={lang} tone="dark" />
        </div>
      </section>
    </>
  );
}
