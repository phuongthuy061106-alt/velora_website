"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HOTEL, roomById, type Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import { addDays, canChange, cancellationFee, formatVND, quote, todayISO, upgradeOptions } from "@/lib/pricing";
import {
  ApiError,
  CHANGEABLE,
  cancelBooking,
  changeBooking,
  lookupBooking,
  type Booking,
} from "@/lib/booking-api";
import QuoteBreakdown from "./QuoteBreakdown";
import { BookingSummary } from "./BookingFlow";
import s from "./Booking.module.css";

export default function BookingLookup({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("code") ?? "");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [mode, setMode] = useState<"none" | "cancel" | "change">("none");
  const [msg, setMsg] = useState("");

  const errText = (e: unknown) => t.errors[(e as ApiError).code] ?? t.errors.NETWORK;

  const find = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !phone.trim()) return setError(t.errors.required);
    setBusy(true);
    setError("");
    setMsg("");
    setMode("none");
    try {
      setBooking(await lookupBooking(code.trim(), phone.trim()));
    } catch (err) {
      setBooking(null);
      setError(errText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.flow}>
      <form className={`${s.panel} ${s.lookupForm}`} onSubmit={find} noValidate>
        <div className="field">
          <label htmlFor="l-code">{t.lookup.code}</label>
          <input
            id="l-code"
            className="input"
            value={code}
            placeholder={t.lookup.codePh}
            autoCapitalize="characters"
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="l-phone">{t.lookup.phone}</label>
          <input
            id="l-phone"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn--book" disabled={busy}>
          {busy ? t.lookup.loading : t.lookup.submit}
        </button>
        {error && (
          <p className={`notice notice--error ${s.full}`} role="alert">
            {error}
          </p>
        )}
      </form>

      {booking && (
        <section className={s.panel} aria-labelledby="bk-title" aria-live="polite">
          <div className={s.resultHead}>
            <h2 id="bk-title" className="display h2">
              {booking.code}
            </h2>
            <span className={`${s.status} ${s["st_" + booking.status] ?? ""}`}>{t.lookup.statuses[booking.status]}</span>
          </div>
          <BookingSummary booking={booking} lang={lang} />
          {booking.status === "DA_HUY" && booking.cancelFee !== undefined && (
            <p className="small muted">
              {t.lookup.cancelTitle}: {formatVND(booking.cancelFee, lang)}
            </p>
          )}

          {msg && (
            <p className="notice notice--ok" role="status">
              {msg}
            </p>
          )}

          {CHANGEABLE.includes(booking.status) && (
            <>
              <div className={s.row}>
                <button
                  type="button"
                  className={`btn ${mode === "change" ? "" : "btn--ghost"}`}
                  aria-expanded={mode === "change"}
                  onClick={() => setMode(mode === "change" ? "none" : "change")}
                >
                  {t.lookup.changeTitle}
                </button>
                <button
                  type="button"
                  className={`btn ${mode === "cancel" ? "" : "btn--ghost"}`}
                  aria-expanded={mode === "cancel"}
                  onClick={() => setMode(mode === "cancel" ? "none" : "cancel")}
                >
                  {t.lookup.cancelTitle}
                </button>
              </div>

              {mode === "cancel" && (
                <CancelBox
                  lang={lang}
                  booking={booking}
                  phone={phone}
                  errText={errText}
                  onKeep={() => setMode("none")}
                  onDone={(b) => {
                    setBooking(b);
                    setMode("none");
                    setMsg(t.lookup.cancelled(formatVND(b.cancelFee ?? 0, lang)));
                  }}
                />
              )}
              {mode === "change" && (
                <ChangeBox
                  lang={lang}
                  booking={booking}
                  phone={phone}
                  errText={errText}
                  onDone={(b) => {
                    setBooking(b);
                    setMode("none");
                    setMsg(t.lookup.changed);
                  }}
                />
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

function CancelBox({
  lang,
  booking,
  phone,
  onKeep,
  onDone,
  errText,
}: {
  lang: Lang;
  booking: Booking;
  phone: string;
  onKeep: () => void;
  onDone: (b: Booking) => void;
  errText: (e: unknown) => string;
}) {
  const t = dict(lang).lookup;
  const policy = cancellationFee(booking.quote.total, booking.checkIn);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  if (!policy.allowed)
    return (
      <p className="notice">
        {t.cancelSameDay} {HOTEL.hotline}.
      </p>
    );

  const confirm = async () => {
    setBusy(true);
    setErr("");
    try {
      onDone(await cancelBooking(booking.code, phone));
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.subPanel}>
      <p>
        {policy.fee === 0 ? t.cancelFree(policy.daysBefore) : t.cancelFee(formatVND(policy.fee, lang), policy.daysBefore)}
      </p>
      <p className="small muted">{t.refundNote}</p>
      {err && (
        <p className="notice notice--error" role="alert">
          {err}
        </p>
      )}
      <div className={s.row}>
        <button type="button" className="btn btn--book" onClick={confirm} disabled={busy}>
          {t.confirmCancel}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onKeep}>
          {t.keep}
        </button>
      </div>
    </div>
  );
}

function ChangeBox({
  lang,
  booking,
  phone,
  onDone,
  errText,
}: {
  lang: Lang;
  booking: Booking;
  phone: string;
  onDone: (b: Booking) => void;
  errText: (e: unknown) => string;
}) {
  const d = dict(lang);
  const t = d.lookup;
  const [checkIn, setCheckIn] = useState(booking.checkIn);
  const [checkOut, setCheckOut] = useState(booking.checkOut);
  const [types, setTypes] = useState(booking.rooms.map((l) => l.roomTypeId));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayISO()), []);

  if (!canChange(booking.checkIn))
    return (
      <p className="notice">
        {t.changeLate} {HOTEL.hotline}.
      </p>
    );

  const valid = checkIn >= (today || "0") && checkOut > checkIn;
  const lines = booking.rooms.map((l, i) => ({ roomTypeId: types[i], guests: l.guests }));
  const q = valid ? quote(lines, checkIn, checkOut) : null;
  const unchanged =
    checkIn === booking.checkIn && checkOut === booking.checkOut && types.every((x, i) => x === booking.rooms[i].roomTypeId);

  const save = async () => {
    if (!valid) return setErr(d.errors.dates);
    setBusy(true);
    setErr("");
    try {
      onDone(await changeBooking(booking.code, phone, { checkIn, checkOut, roomTypeIds: types }));
    } catch (e) {
      setErr(errText(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={s.subPanel}>
      <p className="small muted">{t.changeHint}</p>
      <div className={s.changeGrid}>
        <div className="field">
          <label htmlFor="c-in">{d.search.checkIn}</label>
          <input
            id="c-in"
            type="date"
            className="input"
            min={today || undefined}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, 1));
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="c-out">{d.search.checkOut}</label>
          <input
            id="c-out"
            type="date"
            className="input"
            min={checkIn ? addDays(checkIn, 1) : undefined}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
        {booking.rooms.map((l, i) => (
          <div className="field" key={i}>
            <label htmlFor={`c-room-${i}`}>{d.book.roomN(i + 1, roomById(l.roomTypeId)?.name ?? "")}</label>
            <select
              id={`c-room-${i}`}
              className="input"
              value={types[i]}
              onChange={(e) => setTypes(types.map((x, j) => (j === i ? e.target.value : x)))}
            >
              {upgradeOptions(l.roomTypeId, l.guests).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}, {formatVND(r.pricePerNight, lang)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {q && !unchanged && <QuoteBreakdown q={q} lang={lang} title={t.newQuote} />}
      {err && (
        <p className="notice notice--error" role="alert">
          {err}
        </p>
      )}
      <button type="button" className="btn btn--book" onClick={save} disabled={busy || unchanged}>
        {t.confirmChange}
      </button>
    </div>
  );
}
