import type { Lang, PriceRow } from "@/lib/hotel";

export default function PriceRows({ rows, lang }: { rows: PriceRow[]; lang: Lang }) {
  return (
    <ul className="rows">
      {rows.map((r) => (
        <li key={r.name.en}>
          <span className="r-name">
            {r.name[lang]}
            {r.detail && <span className="r-detail">{r.detail[lang]}</span>}
          </span>
          <span className="r-price">{r.price[lang]}</span>
        </li>
      ))}
    </ul>
  );
}
