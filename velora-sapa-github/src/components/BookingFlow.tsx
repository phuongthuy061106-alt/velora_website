"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HOTEL, ROOMS, SERVICE_ITEMS, roomById, serviceById, type Lang, type ServiceGroup } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import {
  capacity,
  checkRoom,
  defaultGuests,
  formatDate,
  formatVND,
  isValidISO,
  noExtras,
  quote,
  type EarlyCheckIn,
  type Extras,
  type LateCheckOut,
  type RoomGuests,
  type RoomLine,
} from "@/lib/pricing";
import {
  ApiError,
  createBooking,
  searchAvailability,
  type AvailabilityResult,
  type Booking,
  type PaymentMethod,
} from "@/lib/booking-api";
import StaySearch, { staySearchParams, type Stay } from "./StaySearch";
import Stepper from "./Stepper";
import QuoteBreakdown from "./QuoteBreakdown";
import MockQR from "./MockQR";
import RoomDetailDialog from "./RoomDetailDialog";
import s from "./Booking.module.css";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Contact = { fullName: string; phone: string; email: string; note: string };

const PHONE_RE = /^\+?[\d\s.-]{9,18}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BookingFlow({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const params = useSearchParams();
  const preferred = params.get("room") ?? undefined;
  const initialStay = useMemo<Stay | null>(() => {
    const a = params.get("in");
    const b = params.get("out");
    return isValidISO(a) && isValidISO(b) ? { checkIn: a, checkOut: b } : null;
  }, [params]);

  const [step, setStep] = useState<Step>(1);
  const [stay, setStay] = useState<Stay | null>(initialStay);
  const [avail, setAvail] = useState<AvailabilityResult | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [lines, setLines] = useState<RoomLine[]>([]);
  const [extras, setExtras] = useState<Extras>(noExtras());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [contact, setContact] = useState<Contact>({ fullName: "", phone: "", email: "", note: "" });
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const headRef = useRef<HTMLHeadingElement>(null);

  const go = (n: Step) => {
    setError("");
    setStep(n);
    requestAnimationFrame(() => {
      headRef.current?.focus({ preventScroll: true });
      const top = Math.max(0, (headRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 140);
      if (window.__lenis) window.__lenis.scrollTo(top, { duration: 0.9 });
      else window.scrollTo({ top, behavior: "smooth" });
    });
  };

  const search = async (q: Stay) => {
    setStay(q);
    setLoading(true);
    setError("");
    window.history.replaceState(null, "", `?${staySearchParams(q, preferred)}`);
    try {
      const res = await searchAvailability(q.checkIn, q.checkOut);
      setAvail(res);
      // Giữ lựa chọn cũ nếu vẫn còn phòng; lần đầu thì chọn sẵn 1 phòng của hạng khách xem trước đó.
      setCounts((prev) => {
        const next: Record<string, number> = {};
        for (const r of res.rooms) {
          const want = prev[r.roomTypeId] ?? (Object.keys(prev).length === 0 && r.roomTypeId === preferred ? 1 : 0);
          next[r.roomTypeId] = Math.min(want, r.available);
        }
        return next;
      });
      go(2);
    } catch (e) {
      setError(t.errors[(e as ApiError).code] ?? t.errors.NETWORK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialStay) search(initialStay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalRooms = Object.values(counts).reduce((a, b) => a + b, 0);

  /** Từ số lượng mỗi hạng sang danh sách từng phòng, giữ lại khách đã nhập nếu có. */
  const toGuests = () => {
    const prevByType = new Map<string, RoomGuests[]>();
    lines.forEach((l) => prevByType.set(l.roomTypeId, [...(prevByType.get(l.roomTypeId) ?? []), l.guests]));
    const next: RoomLine[] = [];
    for (const r of ROOMS) {
      const n = counts[r.id] ?? 0;
      const prev = prevByType.get(r.id) ?? [];
      for (let i = 0; i < n; i++) next.push({ roomTypeId: r.id, guests: prev[i] ?? defaultGuests() });
    }
    setLines(next);
    go(3);
  };

  const q = stay && lines.length ? quote(lines, stay.checkIn, stay.checkOut, extras) : null;
  const linesValid = lines.length > 0 && lines.every((l) => !checkRoom(roomById(l.roomTypeId)!, l.guests));
  const stayText = stay ? t.book.stayLine(formatDate(stay.checkIn, lang), formatDate(stay.checkOut, lang), quote([], stay.checkIn, stay.checkOut).nights) : "";

  return (
    <div className={s.flow}>
      {step < 7 && (
        <ol className={s.steps} aria-label={t.book.title}>
          {t.book.steps.map((label, i) => (
            <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={step > i + 1 ? s.done : ""}>
              <span className={s.stepNo}>{i + 1}</span>
              <span className={s.stepLabel}>{label}</span>
            </li>
          ))}
        </ol>
      )}

      {/* Bước 1: ngày ở */}
      {step === 1 && (
        <section className={s.panel} aria-labelledby="b1">
          <h2 id="b1" ref={headRef} tabIndex={-1} className="h3">
            {t.book.steps[0]}
          </h2>
          <StaySearch lang={lang} initial={stay ?? undefined} onSearch={search} busy={loading} />
          {error && <p className="notice notice--error" role="alert">{error}</p>}
        </section>
      )}

      {step > 1 && step < 7 && stay && (
        <div className={s.stayBar}>
          <span>{stayText}</span>
          <button type="button" className="link" onClick={() => go(1)}>
            {t.book.editDates}
          </button>
        </div>
      )}

      {/* Bước 2: chọn hạng phòng và số lượng */}
      {step === 2 && avail && (
        <section className={s.panel} aria-labelledby="b2">
          <h2 id="b2" ref={headRef} tabIndex={-1} className="h3">
            {t.book.steps[1]}
          </h2>
          {avail.peak && <p className="notice small">{t.book.peak}</p>}
          {avail.rooms.every((r) => r.available === 0) && <p className="notice">{t.book.soldOutAll}</p>}
          <ul className={s.results}>
            {avail.rooms.map((a) => {
              const r = roomById(a.roomTypeId)!;
              const n = counts[r.id] ?? 0;
              return (
                <li key={r.id} className={`${s.result} ${a.available === 0 ? s.disabled : ""} ${n > 0 ? s.picked : ""}`}>
                  <button
                    type="button"
                    className={`media ${s.thumb} ${s.thumbBtn}`}
                    onClick={() => setDetailId(r.id)}
                    aria-label={`${t.book.viewRoom}: ${r.name}`}
                  >
                    <Image src={r.image} alt="" fill sizes="(max-width: 640px) 100vw, 260px" placeholder="blur" />
                  </button>
                  <div className={s.resultBody}>
                    <div className={s.resultHead}>
                      <h3 className="h3">{r.name}</h3>
                      <span className={`${s.badge} ${a.available === 0 ? s.badgeOut : a.available <= 3 ? s.badgeLow : ""}`}>
                        {t.book.left(a.available)}
                      </span>
                    </div>
                    <p className="muted small">
                      {r.area} m², {r.beds[lang].toLowerCase()}
                      <br />
                      {t.rooms.capacity}: {t.rooms.capacityText(r.maxAdults, r.maxChildren, r.childAgeLimit).toLowerCase()}
                    </p>
                    <p className={s.rate}>
                      <span className="num">{formatVND(a.pricePerNight, lang)}</span> <span className="muted small">{t.book.perNight}</span>
                    </p>
                    <button type="button" className={`link ${s.viewBtn}`} onClick={() => setDetailId(r.id)}>
                      {t.book.viewRoom}
                    </button>
                  </div>
                  <div className={s.qty}>
                    <Stepper
                      label={t.book.rooms}
                      value={n}
                      min={0}
                      max={a.available}
                      onChange={(v) => setCounts({ ...counts, [r.id]: v })}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className={s.footBar}>
            <span className={s.footCount} aria-live="polite">
              {t.book.selected(totalRooms)}
            </span>
            <button type="button" className="btn btn--book" disabled={totalRooms === 0} onClick={toGuests}>
              {t.book.next}
            </button>
          </div>
          {totalRooms === 0 && <p className="small muted">{t.book.noneSelected}</p>}
          <RoomDetailDialog room={detailId ? roomById(detailId) ?? null : null} lang={lang} onClose={() => setDetailId(null)} />
        </section>
      )}

      {/* Bước 3: khách từng phòng */}
      {step === 3 && stay && q && (
        <section className={`${s.panel} ${s.withSide}`} aria-labelledby="b3">
          <div className={s.mainCol}>
            <h2 id="b3" ref={headRef} tabIndex={-1} className="h3">
              {t.book.steps[2]}
            </h2>
            {lines.map((l, i) => (
              <RoomGuestsCard
                key={i}
                index={i}
                lang={lang}
                line={l}
                onChange={(g) => setLines(lines.map((x, j) => (j === i ? { ...x, guests: g } : x)))}
              />
            ))}
            <div className={s.row}>
              <button type="button" className="btn btn--book" disabled={!linesValid} onClick={() => go(4)}>
                {t.book.next}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => go(2)}>
                {t.book.back}
              </button>
            </div>
          </div>
          <aside className={s.side}>
            <QuoteBreakdown q={q} lang={lang} />
          </aside>
        </section>
      )}

      {/* Bước 4: dịch vụ đặt kèm */}
      {step === 4 && q && (
        <section className={`${s.panel} ${s.withSide}`} aria-labelledby="b4s">
          <div className={s.mainCol}>
            <h2 id="b4s" ref={headRef} tabIndex={-1} className="h3">
              {t.book.svcTitle}
            </h2>
            <ServicesPicker lang={lang} value={extras} onChange={setExtras} />
            <div className={s.row}>
              <button type="button" className="btn btn--book" onClick={() => go(5)}>
                {t.book.next}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => go(3)}>
                {t.book.back}
              </button>
            </div>
          </div>
          <aside className={s.side}>
            <QuoteBreakdown q={q} lang={lang} />
          </aside>
        </section>
      )}

      {/* Bước 5: thông tin liên hệ */}
      {step === 5 && q && (
        <ContactForm
          lang={lang}
          headRef={headRef}
          value={contact}
          onChange={setContact}
          onBack={() => go(4)}
          onNext={() => go(6)}
          aside={<QuoteBreakdown q={q} lang={lang} />}
        />
      )}

      {/* Bước 6: thanh toán */}
      {step === 6 && stay && q && (
        <PaymentStep
          lang={lang}
          headRef={headRef}
          deposit={q.deposit}
          contact={contact}
          error={error}
          busy={loading}
          onBack={() => go(5)}
          aside={<QuoteBreakdown q={q} lang={lang} />}
          onSubmit={async (method) => {
            setLoading(true);
            setError("");
            try {
              const b = await createBooking({
                checkIn: stay.checkIn,
                checkOut: stay.checkOut,
                rooms: lines,
                extras,
                fullName: contact.fullName.trim(),
                phone: contact.phone.trim(),
                email: contact.email.trim(),
                note: contact.note.trim() || undefined,
                paymentMethod: method,
              });
              setBooking(b);
              go(7);
            } catch (e) {
              setError(t.errors[(e as ApiError).code] ?? t.errors.NETWORK);
            } finally {
              setLoading(false);
            }
          }}
        />
      )}

      {/* Hoàn tất */}
      {step === 7 && booking && (
        <section className={`${s.panel} ${s.done6}`} aria-labelledby="b6">
          <h2 id="b6" ref={headRef} tabIndex={-1} className="display h2">
            {t.book.doneTitle}
          </h2>
          <p className="lead">{booking.payment.depositPaid > 0 ? t.book.donePaid : t.book.doneLater}</p>
          <div className={s.codeBox}>
            <span className="small muted">{t.book.code}</span>
            <strong className={`display ${s.code}`}>{booking.code}</strong>
            <span className="small muted">{t.book.keepCode}</span>
          </div>
          <BookingSummary booking={booking} lang={lang} />
          <p className="small muted">{t.demo}</p>
          <div className={s.row}>
            <Link href={`/${lang}/booking?code=${encodeURIComponent(booking.code)}`} className="btn btn--book">
              {t.book.viewBooking}
            </Link>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                setBooking(null);
                setLines([]);
                setExtras(noExtras());
                setCounts({});
                setAvail(null);
                go(1);
              }}
            >
              {t.book.another}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------- Khách trong một phòng ---------- */
function RoomGuestsCard({
  index,
  lang,
  line,
  onChange,
}: {
  index: number;
  lang: Lang;
  line: RoomLine;
  onChange: (g: RoomGuests) => void;
}) {
  const t = dict(lang).book;
  const room = roomById(line.roomTypeId)!;
  const g = line.guests;
  const cap = capacity(room, g.extraBed);
  const adultsFull = g.adults >= cap.maxAdults;
  const kidsFull = g.children >= cap.maxChildren;
  const extraKids = Math.max(0, g.children - cap.freeChildren);
  // Không cho bỏ giường phụ khi đang có người lớn ngủ trên đó.
  const bedLocked = g.extraBed && g.adults > room.maxAdults;

  return (
    <fieldset className={s.roomCard}>
      <legend className={s.roomLegend}>
        <span className="h3">{t.roomN(index + 1, room.name)}</span>
        <span className="small muted">{t.capacityNow(room.maxAdults, room.maxChildren)}</span>
      </legend>

      <div className={s.guestGrid}>
        <Stepper
          label={t.adults}
          hint={t.adultsHint}
          value={g.adults}
          min={1}
          max={cap.maxAdults}
          maxReason={t.full}
          onChange={(v) => onChange({ ...g, adults: v })}
        />
        <Stepper
          label={t.children}
          hint={t.childrenHint(room.maxChildren)}
          value={g.children}
          min={0}
          max={cap.maxChildren}
          maxReason={t.fullKids}
          onChange={(v) => onChange({ ...g, children: v })}
        />
      </div>

      {extraKids > 0 && <p className="small notice">{t.extraChildNote(extraKids)}</p>}

      <label className={`${s.check} ${bedLocked ? s.checkLocked : ""}`}>
        <input
          type="checkbox"
          checked={g.extraBed}
          disabled={bedLocked}
          onChange={(e) => onChange({ ...g, extraBed: e.target.checked })}
        />
        <span>
          <strong>{t.extraBed}</strong>
          <span className="small muted">{bedLocked ? t.extraBedLocked : t.extraBedHint}</span>
        </span>
      </label>

      {(adultsFull || kidsFull) && (
        <p className={`small ${s.capNote}`} role="status">
          {adultsFull && (g.extraBed ? t.fullWithBed : t.full)} {kidsFull && t.fullKids}
        </p>
      )}
    </fieldset>
  );
}

/* ---------- Dịch vụ đặt kèm ---------- */
function ServicesPicker({ lang, value, onChange }: { lang: Lang; value: Extras; onChange: (e: Extras) => void }) {
  const t = dict(lang).book;
  const qtyOf = (id: string) => value.services.find((x) => x.id === id)?.qty ?? 0;
  const setQty = (id: string, qty: number) =>
    onChange({ ...value, services: [...value.services.filter((x) => x.id !== id), ...(qty > 0 ? [{ id, qty }] : [])] });
  const groups: ServiceGroup[] = ["spa", "transfer", "tour", "laundry"];

  return (
    <div className={s.svc}>
      <p className="muted">{t.svcIntro}</p>
      {groups.map((gr) => (
        <fieldset key={gr} className={s.svcGroup}>
          <legend className="h3">{t.groups[gr]}</legend>
          <ul className={s.svcList}>
            {SERVICE_ITEMS.filter((x) => x.group === gr).map((x) => {
              const n = qtyOf(x.id);
              return (
                <li key={x.id} className={`${s.svcItem} ${n > 0 ? s.picked : ""}`}>
                  <div>
                    <p className={s.svcName}>{x.name[lang]}</p>
                    <p className="small muted">
                      {x.detail ? `${x.detail[lang]}. ` : ""}
                      <span className="num">{formatVND(x.price, lang)}</span>
                      {t.per(x.unit[lang])}
                    </p>
                  </div>
                  <div className={s.svcQty}>
                    <Stepper label={`${t.qty}: ${x.name[lang]}`} value={n} min={0} max={10} onChange={(v) => setQty(x.id, v)} />
                  </div>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}

      <fieldset className={s.svcGroup}>
        <legend className="h3">
          {t.early} / {t.late}
        </legend>
        <div className={s.guestGrid}>
          <div className="field">
            <label htmlFor="x-early">{t.early}</label>
            <select
              id="x-early"
              className="input"
              value={value.early}
              onChange={(e) => onChange({ ...value, early: e.target.value as EarlyCheckIn })}
            >
              {(Object.keys(t.earlyOpts) as EarlyCheckIn[]).map((k) => (
                <option key={k} value={k}>
                  {t.earlyOpts[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="x-late">{t.late}</label>
            <select
              id="x-late"
              className="input"
              value={value.late}
              onChange={(e) => onChange({ ...value, late: e.target.value as LateCheckOut })}
            >
              {(Object.keys(t.lateOpts) as LateCheckOut[]).map((k) => (
                <option key={k} value={k}>
                  {t.lateOpts[k]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="small muted">{t.timeNote}</p>
      </fieldset>
      <p className="small muted">{t.otherNote}</p>
    </div>
  );
}

/* ---------- Bước 4 ---------- */
function ContactForm({
  lang,
  headRef,
  value,
  onChange,
  onBack,
  onNext,
  aside,
}: {
  lang: Lang;
  headRef: React.RefObject<HTMLHeadingElement | null>;
  value: Contact;
  onChange: (c: Contact) => void;
  onBack: () => void;
  onNext: () => void;
  aside: React.ReactNode;
}) {
  const t = dict(lang);
  const [errs, setErrs] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!value.fullName.trim()) e.fullName = t.errors.required;
    const digits = value.phone.replace(/\D/g, "");
    if (!value.phone.trim()) e.phone = t.errors.required;
    else if (!PHONE_RE.test(value.phone.trim()) || digits.length < 9 || digits.length > 15) e.phone = t.errors.phone;
    if (!value.email.trim()) e.email = t.errors.required;
    else if (!EMAIL_RE.test(value.email.trim())) e.email = t.errors.email;
    setErrs(e);
    return e;
  };

  const field = (key: "fullName" | "phone" | "email", label: string, type: string, autoComplete: string) => (
    <div className="field">
      <label htmlFor={`c-${key}`}>{label}</label>
      <input
        id={`c-${key}`}
        className="input"
        type={type}
        autoComplete={autoComplete}
        inputMode={key === "phone" ? "tel" : undefined}
        value={value[key]}
        aria-invalid={!!errs[key]}
        aria-describedby={errs[key] ? `c-${key}-err` : undefined}
        onChange={(e) => onChange({ ...value, [key]: e.target.value })}
        onBlur={() => errs[key] && validate()}
      />
      {errs[key] && (
        <p id={`c-${key}-err`} className="err">
          {errs[key]}
        </p>
      )}
    </div>
  );

  return (
    <section className={`${s.panel} ${s.withSide}`} aria-labelledby="b4">
      <form
        className={s.mainCol}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const first = Object.keys(validate())[0];
          if (first) document.getElementById(`c-${first}`)?.focus();
          else onNext();
        }}
      >
        <h2 id="b4" ref={headRef} tabIndex={-1} className="h3">
          {t.book.steps[4]}
        </h2>
        {field("fullName", t.book.fullName, "text", "name")}
        <div className={s.guestGrid}>
          {field("phone", t.book.phone, "tel", "tel")}
          {field("email", t.book.email, "email", "email")}
        </div>
        <div className="field">
          <label htmlFor="c-note">
            {t.book.note} <span className="hint">({t.book.optional})</span>
          </label>
          <textarea
            id="c-note"
            className="input"
            placeholder={t.book.notePh}
            maxLength={500}
            value={value.note}
            onChange={(e) => onChange({ ...value, note: e.target.value })}
          />
        </div>
        <p className="small muted">{t.book.privacy}</p>
        <div className={s.row}>
          <button type="submit" className="btn btn--book">
            {t.book.next}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            {t.book.back}
          </button>
        </div>
      </form>
      <aside className={s.side}>{aside}</aside>
    </section>
  );
}

/* ---------- Bước 5 ---------- */
function PaymentStep({
  lang,
  headRef,
  deposit,
  contact,
  error,
  busy,
  onBack,
  onSubmit,
  aside,
}: {
  lang: Lang;
  headRef: React.RefObject<HTMLHeadingElement | null>;
  deposit: number;
  contact: Contact;
  error: string;
  busy: boolean;
  onBack: () => void;
  onSubmit: (m: PaymentMethod) => void;
  aside: React.ReactNode;
}) {
  const t = dict(lang);
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [agree, setAgree] = useState(false);
  const [agreeErr, setAgreeErr] = useState(false);
  const ref = `VELORA ${contact.phone.replace(/\D/g, "").slice(-4)} ${contact.fullName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toUpperCase()
    .slice(0, 24)}`;

  return (
    <section className={`${s.panel} ${s.withSide}`} aria-labelledby="b5">
      <div className={s.mainCol}>
        <h2 id="b5" ref={headRef} tabIndex={-1} className="h3">
          {t.book.payTitle}
        </h2>
        <p className="muted">{t.book.payIntro}</p>

        <fieldset className={s.methods}>
          <legend className="sr-only">{t.book.payTitle}</legend>
          {(Object.keys(t.book.methods) as PaymentMethod[]).map((m) => (
            <label key={m} className={`${s.method} ${method === m ? s.methodOn : ""}`}>
              <input type="radio" name="pay" value={m} checked={method === m} onChange={() => setMethod(m)} />
              <span>
                <strong>{t.book.methods[m].label}</strong>
                <span className="small muted">{t.book.methods[m].hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {method !== "PAY_LATER" && (
          <div className={s.qrBox}>
            <MockQR seed={ref + deposit} label={t.book.qrNote} />
            <dl className={s.qrInfo}>
              <div>
                <dt>{t.book.amount}</dt>
                <dd className="num">{formatVND(deposit, lang)}</dd>
              </div>
              <div>
                <dt>{t.book.transferContent}</dt>
                <dd>{ref}</dd>
              </div>
              <p className="small muted">{t.book.qrNote}</p>
            </dl>
          </div>
        )}

        <label className={s.check}>
          <input
            type="checkbox"
            checked={agree}
            aria-invalid={agreeErr}
            onChange={(e) => {
              setAgree(e.target.checked);
              setAgreeErr(false);
            }}
          />
          <span>
            {t.book.agree}{" "}
            <Link href={`/${lang}/info#cancel`} target="_blank" className="link">
              {t.book.agreeLink}
            </Link>
          </span>
        </label>
        {agreeErr && <p className="err">{t.book.agreeErr}</p>}
        {error && <p className="notice notice--error" role="alert">{error}</p>}

        <div className={s.row}>
          <button
            type="button"
            className="btn btn--book"
            disabled={busy}
            onClick={() => (agree ? onSubmit(method) : setAgreeErr(true))}
          >
            {busy ? t.book.submitting : method === "PAY_LATER" ? t.book.payLater : t.book.payNow(formatVND(deposit, lang))}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            {t.book.back}
          </button>
        </div>
        <p className="small muted">
          {t.footer.hotline}: {HOTEL.hotline}
        </p>
      </div>
      <aside className={s.side}>{aside}</aside>
    </section>
  );
}

export function BookingSummary({ booking, lang }: { booking: Booking; lang: Lang }) {
  const t = dict(lang);
  return (
    <dl className={s.summary}>
      <div>
        <dt>{t.lookup.stay}</dt>
        <dd>{t.book.stayLine(formatDate(booking.checkIn, lang), formatDate(booking.checkOut, lang), booking.quote.nights)}</dd>
      </div>
      <div>
        <dt>{t.lookup.rooms}</dt>
        <dd>
          <ul className={s.plainList}>
            {booking.rooms.map((l, i) => (
              <li key={i}>
                {t.book.roomN(i + 1, roomById(l.roomTypeId)?.name ?? "")}: {t.book.guestsText(l.guests.adults, l.guests.children)}
                {l.guests.extraBed ? `, ${t.book.withBed}` : ""}
              </li>
            ))}
          </ul>
        </dd>
      </div>
      {booking.quote.extrasTotal > 0 && (
        <div>
          <dt>{t.book.svcBreakdown}</dt>
          <dd>
            <ul className={s.plainList}>
              {booking.quote.services.map((x) => (
                <li key={x.id}>
                  {serviceById(x.id)?.name[lang]} × {x.qty}
                </li>
              ))}
              {booking.quote.earlyFee > 0 && (
                <li>
                  {t.book.early}: {t.book.earlyOpts[booking.extras.early]}
                </li>
              )}
              {booking.quote.lateFee > 0 && (
                <li>
                  {t.book.late}: {t.book.lateOpts[booking.extras.late]}
                </li>
              )}
            </ul>
          </dd>
        </div>
      )}
      <div>
        <dt>{t.book.fullName}</dt>
        <dd>{booking.fullName}</dd>
      </div>
      <div>
        <dt>{t.lookup.total}</dt>
        <dd className="num">{formatVND(booking.quote.total, lang)}</dd>
      </div>
      <div>
        <dt>{t.lookup.paid}</dt>
        <dd className="num">{formatVND(booking.payment.depositPaid, lang)}</dd>
      </div>
      {booking.quote.extrasTotal > 0 && (
        <div>
          <dt>{t.book.grandTotal}</dt>
          <dd className="num">
            {formatVND(booking.quote.grandTotal, lang)} ({t.book.extrasTotal}: {formatVND(booking.quote.extrasTotal, lang)})
          </dd>
        </div>
      )}
    </dl>
  );
}
