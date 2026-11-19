import { roomById, serviceById, type Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import { formatVND, type Quote } from "@/lib/pricing";
import s from "./Booking.module.css";

/** Trình bày cách tính tiền từng phòng và từng dịch vụ để khách tự kiểm tra. */
export default function QuoteBreakdown({ q, lang, title }: { q: Quote; lang: Lang; title?: string }) {
  const t = dict(lang).book;
  const hasExtras = q.extrasTotal > 0;
  return (
    <div className={s.quote}>
      <p className={s.quoteTitle}>{title ?? t.breakdown}</p>
      {q.lines.map((l, i) => (
        <div key={i} className={s.qLine}>
          <p className={s.qRoom}>{t.roomN(i + 1, roomById(l.roomTypeId)?.name ?? l.roomTypeId)}</p>
          <dl>
            <div>
              <dt>{t.lineRoom}</dt>
              <dd className="num">{formatVND(l.roomRate, lang)}</dd>
            </div>
            {l.extraChildren > 0 && (
              <div>
                <dt>{t.lineKids(l.extraChildren)}</dt>
                <dd className="num">{formatVND(l.childFeePerNight, lang)}</dd>
              </div>
            )}
            {l.extraBedFeePerNight > 0 && (
              <div>
                <dt>{t.lineBed}</dt>
                <dd className="num">{formatVND(l.extraBedFeePerNight, lang)}</dd>
              </div>
            )}
            <div className={s.qSub}>
              <dt>
                {formatVND(l.perNight, lang)} {t.times(q.nights)}
              </dt>
              <dd className="num">{formatVND(l.total, lang)}</dd>
            </div>
          </dl>
        </div>
      ))}
      <dl>
        <div className={s.total}>
          <dt>{t.total}</dt>
          <dd className="num">{formatVND(q.total, lang)}</dd>
        </div>
        <div>
          <dt>{t.deposit}</dt>
          <dd className="num">{formatVND(q.deposit, lang)}</dd>
        </div>
      </dl>

      {hasExtras && (
        <div className={s.qLine}>
          <p className={s.qRoom}>{t.svcBreakdown}</p>
          <dl>
            {q.services.map((x) => {
              const item = serviceById(x.id);
              return (
                <div key={x.id}>
                  <dt>
                    {item?.name[lang]} × {x.qty}
                  </dt>
                  <dd className="num">{formatVND(x.total, lang)}</dd>
                </div>
              );
            })}
            {q.earlyFee > 0 && (
              <div>
                <dt>{t.earlyLine}</dt>
                <dd className="num">{formatVND(q.earlyFee, lang)}</dd>
              </div>
            )}
            {q.lateFee > 0 && (
              <div>
                <dt>{t.lateLine}</dt>
                <dd className="num">{formatVND(q.lateFee, lang)}</dd>
              </div>
            )}
            <div className={s.qSub}>
              <dt>{t.extrasTotal}</dt>
              <dd className="num">{formatVND(q.extrasTotal, lang)}</dd>
            </div>
          </dl>
        </div>
      )}
      {hasExtras && (
        <dl>
          <div className={s.total}>
            <dt>{t.grandTotal}</dt>
            <dd className="num">{formatVND(q.grandTotal, lang)}</dd>
          </div>
        </dl>
      )}
      {q.peak && <p className="notice small">{t.peak}</p>}
    </div>
  );
}
