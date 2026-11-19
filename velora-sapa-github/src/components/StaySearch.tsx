"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import type { Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import { addDays, daysBetween, todayISO } from "@/lib/pricing";
import s from "./StaySearch.module.css";

export type Stay = { checkIn: string; checkOut: string };

export const staySearchParams = (q: Stay, room?: string) => {
  const p = new URLSearchParams({ in: q.checkIn, out: q.checkOut });
  if (room) p.set("room", room);
  return p.toString();
};

type Props = {
  lang: Lang;
  initial?: Partial<Stay>;
  /** Có onSearch thì gọi trực tiếp (trang đặt phòng); không có thì chuyển sang /book. */
  onSearch?: (q: Stay) => void;
  room?: string;
  tone?: "light" | "dark";
  busy?: boolean;
};

/** Bước 1 của đặt phòng: chỉ chọn ngày nhận và ngày trả phòng. */
export default function StaySearch({ lang, initial, onSearch, room, tone = "light", busy }: Props) {
  const t = dict(lang);
  const router = useRouter();
  const id = useId();
  // Ngày mặc định tính ở trình duyệt (trang được dựng tĩnh, ngày lúc build sẽ cũ).
  const [today, setToday] = useState("");
  const [checkIn, setCheckIn] = useState(initial?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    const d = todayISO();
    setToday(d);
    setCheckIn((v) => v || addDays(d, 14));
    setCheckOut((v) => v || addDays(d, 16));
  }, []);

  const nights = checkIn && checkOut ? daysBetween(checkIn, checkOut) : 0;

  const onCheckIn = (v: string) => {
    setCheckIn(v);
    if (v && checkOut <= v) setCheckOut(addDays(v, 1));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkIn || !checkOut || checkIn < todayISO() || checkOut <= checkIn) return setError(t.errors.dates);
    setError("");
    const q = { checkIn, checkOut };
    if (onSearch) onSearch(q);
    else router.push(`/${lang}/book?${staySearchParams(q, room)}`);
  };

  return (
    <form className={`${s.form} ${tone === "dark" ? s.dark : ""}`} onSubmit={submit} noValidate>
      <div className={s.dates}>
        <div className="field">
          <label htmlFor={`${id}-in`}>{t.search.checkIn}</label>
          <input
            id={`${id}-in`}
            className="input"
            type="date"
            min={today || undefined}
            value={checkIn}
            onChange={(e) => onCheckIn(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-out`}>
            {t.search.checkOut}
            {nights > 0 && <span className={s.nights}> ({t.search.nights(nights)})</span>}
          </label>
          <input
            id={`${id}-out`}
            className="input"
            type="date"
            min={checkIn ? addDays(checkIn, 1) : undefined}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </div>
      </div>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={`btn ${tone === "dark" ? "btn--light" : "btn--book"} ${s.submit}`} disabled={busy}>
        {busy ? t.book.searching : t.search.submit}
      </button>
    </form>
  );
}
