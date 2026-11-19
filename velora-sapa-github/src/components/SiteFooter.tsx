import Link from "next/link";
import { HOTEL, type Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import Wordmark from "./Wordmark";

import s from "./SiteFooter.module.css";

export default function SiteFooter({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <footer className={`dark ${s.footer}`}>
      <div className={`wrap ${s.grid}`}>
        <div className={s.brand}>
          <Wordmark />
        </div>
        <dl className={s.contact}>
          <div>
            <dt>{t.footer.address}</dt>
            <dd>{HOTEL.address}</dd>
          </div>
          <div>
            <dt>{t.footer.hotline}</dt>
            <dd>
              <a href={`tel:${HOTEL.hotline.replace(/\s/g, "")}`}>{HOTEL.hotline}</a>
            </dd>
          </div>
          <div>
            <dt>{t.footer.phone}</dt>
            <dd>
              <a href={`tel:${HOTEL.phone.replace(/\s/g, "")}`}>{HOTEL.phone}</a>
            </dd>
          </div>
          <div>
            <dt>{t.footer.email}</dt>
            <dd>
              <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
            </dd>
          </div>
        </dl>
        <nav className={s.links} aria-label="Footer">
          <Link href={`/${lang}/rooms`}>{t.nav.rooms}</Link>
          <Link href={`/${lang}/services`}>{t.nav.services}</Link>
          <Link href={`/${lang}/info`}>{t.nav.info}</Link>
          <Link href={`/${lang}/booking`}>{t.nav.lookup}</Link>
          <Link href={`/${lang}/book`}>{t.nav.book}</Link>
        </nav>
      </div>
    </footer>
  );
}
