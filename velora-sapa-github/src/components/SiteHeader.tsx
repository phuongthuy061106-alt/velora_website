"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/lib/hotel";
import { HOTEL } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import Wordmark from "./Wordmark";
import menuImg from "@/assets/img/mountains.jpg";
import s from "./SiteHeader.module.css";

export default function SiteHeader({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Trang chủ có ảnh hero tối: header trong suốt cho tới khi cuộn qua hero.
  const overHero = pathname === `/${lang}` || /^\/(vi|en)\/rooms\/[^/]+$/.test(pathname);
  const otherLang: Lang = lang === "vi" ? "en" : "vi";
  const switchHref = pathname.replace(/^\/(vi|en)/, `/${otherLang}`);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      setHidden(y > 400 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const lenis = window.__lenis;
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      panel.current?.querySelector<HTMLElement>("a")?.focus();
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuBtn.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: `/${lang}`, label: t.nav.home },
    { href: `/${lang}/rooms`, label: t.nav.rooms },
    { href: `/${lang}/services`, label: t.nav.services },
    { href: `/${lang}/info`, label: t.nav.info },
    { href: `/${lang}/booking`, label: t.nav.lookup },
  ];

  const light = (overHero && !solid) || open;

  return (
    <>
      <header
        className={`${s.header} ${pathname === `/${lang}` ? s.intro : ""} ${solid && !open ? s.solid : ""} ${light ? s.light : ""} ${hidden && !open ? s.hidden : ""}`}
      >
        <div className={s.bar}>
          <Link href={`/${lang}`} className={s.logo} aria-label={`${HOTEL.name} – ${t.nav.home}`}>
            <Wordmark />
          </Link>

          <nav className={s.inline} aria-label={t.nav.menu}>
            {links.slice(1).map((l) => (
              <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className={s.actions}>
            <Link href={switchHref} className={s.lang} hrefLang={otherLang} lang={otherLang}>
              {otherLang.toUpperCase()}
              <span className="sr-only"> – {t.nav.switchTo}</span>
            </Link>
            <Link href={`/${lang}/book`} className={s.book}>
              {t.nav.book}
            </Link>
            <button
              ref={menuBtn}
              type="button"
              className={s.menuBtn}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? t.nav.close : t.nav.menu}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`${s.burger} ${open ? s.burgerOpen : ""}`} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div id="site-menu" ref={panel} className={`${s.panel} ${open ? s.panelOpen : ""}`} aria-hidden={!open} inert={!open}>
        <nav className={s.nav} aria-label={t.nav.menu}>
          <ol>
            {links.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ol>
          <div className={s.panelFoot}>
            <p>
              <Link href={switchHref} hrefLang={otherLang} lang={otherLang}>
                {t.nav.switchTo}
              </Link>
            </p>
            <p>
              {t.footer.hotline} <a href={`tel:${HOTEL.hotline.replace(/\s/g, "")}`}>{HOTEL.hotline}</a>
            </p>
            <p>
              <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
            </p>
          </div>
        </nav>
        <div className={s.panelImg}>
          <Image src={menuImg} alt="" fill sizes="40vw" placeholder="blur" />
        </div>
      </div>
    </>
  );
}
