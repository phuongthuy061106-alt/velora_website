"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Lang, RoomType } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import { formatVND } from "@/lib/pricing";
import s from "./RoomDetailDialog.module.css";

/** Khung xem nhanh chi tiết và tiện nghi một hạng phòng ngay trong lúc đặt phòng. */
export default function RoomDetailDialog({
  room,
  lang,
  onClose,
}: {
  room: RoomType | null;
  lang: Lang;
  onClose: () => void;
}) {
  const t = dict(lang);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (room && !d.open) {
      d.showModal();
      window.__lenis?.stop();
    }
    if (!room && d.open) d.close();
  }, [room]);

  const close = () => {
    window.__lenis?.start();
    onClose();
  };

  return (
    <dialog
      ref={ref}
      className={s.dialog}
      aria-labelledby="room-dialog-title"
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      data-lenis-prevent
    >
      {room && (
        <div className={s.inner}>
          <div className={`media ${s.img}`}>
            <Image src={room.image} alt={room.name} fill sizes="(max-width: 760px) 100vw, 560px" placeholder="blur" />
          </div>
          <div className={s.body}>
            <div className={s.head}>
              <h2 id="room-dialog-title" className="display h2">
                {room.name}
              </h2>
              <button type="button" className={s.close} onClick={close} aria-label={t.nav.close}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.3" />
                </svg>
              </button>
            </div>
            <p className="muted">{room.summary[lang]}</p>
            <dl className={s.specs}>
              <div>
                <dt>{t.rooms.area}</dt>
                <dd>{room.area} m²</dd>
              </div>
              <div>
                <dt>{t.rooms.beds}</dt>
                <dd>{room.beds[lang]}</dd>
              </div>
              <div>
                <dt>{t.rooms.capacity}</dt>
                <dd>{t.rooms.capacityText(room.maxAdults, room.maxChildren, room.childAgeLimit)}</dd>
              </div>
              <div>
                <dt>{t.rooms.price}</dt>
                <dd className="num">{formatVND(room.pricePerNight, lang)}</dd>
              </div>
            </dl>
            <div>
              <p className={s.label}>{t.rooms.amenities}</p>
              <ul className={s.amen}>
                {room.amenities.map((a) => (
                  <li key={a.en}>{a[lang]}</li>
                ))}
              </ul>
            </div>
            <p className="small muted">
              {t.rooms.extraBedNote} {t.rooms.priceNote}
            </p>
            <div className={s.actions}>
              <button type="button" className="btn btn--book" onClick={close}>
                {t.nav.close}
              </button>
              <Link href={`/${lang}/rooms/${room.id}`} target="_blank" className="link small">
                {t.rooms.details}
              </Link>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
