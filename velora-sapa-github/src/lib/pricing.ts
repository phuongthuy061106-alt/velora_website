// Luật nghiệp vụ: sức chứa từng phòng, báo giá, phí hủy, đổi đơn.
// Nguồn: tài liệu "Thông tin", thẻ Tổng. Các GIẢ ĐỊNH nhóm cần chốt được ghi rõ bên dưới.
import { HOTEL, ROOMS, serviceById, type RoomType } from "./hotel";

export const EXTRA_CHILD_FEE = 100_000; // /trẻ/đêm cho trẻ em vượt sức chứa tiêu chuẩn; trẻ trong sức chứa miễn phí
export const MAX_EXTRA_CHILDREN = 1; // thêm tối đa 1 trẻ ngoài sức chứa tiêu chuẩn mỗi phòng
export const EXTRA_BED_FEE = 200_000; // /khách/đêm, giường phụ cho người lớn hoặc trẻ từ 12 tuổi
export const MAX_EXTRA_BEDS = 1; // tối đa 1 giường phụ mỗi phòng
export const ADULT_AGE = 12;
export const FREE_CANCEL_DAYS = 10; // >= 10 ngày: miễn phí
export const HALF_CANCEL_DAYS = 4; // 4–9 ngày: 50%; 1–3 ngày: 100%
export const MIN_CHANGE_DAYS = 3; // đổi ngày/hạng phòng: báo trước ít nhất 3 ngày

/** Khách trong MỘT phòng. Trẻ từ 12 tuổi nhập vào số người lớn. */
export type RoomGuests = { adults: number; children: number; extraBed: boolean };
/** Một dòng trong đơn = một phòng (khớp bảng ChiTietDon). */
export type RoomLine = { roomTypeId: string; guests: RoomGuests };

const DAY = 86_400_000;
const toUTC = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const todayISO = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().slice(0, 10);
};
export const addDays = (iso: string, n: number) => new Date(toUTC(iso) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (from: string, to: string) => Math.round((toUTC(to) - toUTC(from)) / DAY);
export const isValidISO = (s: string | null | undefined): s is string =>
  !!s && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toUTC(s));

/* ---------------- Sức chứa ---------------- */

/** Giới hạn một phòng.
 *  - Người lớn: theo sức chứa tiêu chuẩn, giường phụ cho thêm đúng 1 người lớn (200.000đ/đêm).
 *  - Trẻ em: trong sức chứa tiêu chuẩn miễn phí; được thêm tối đa 1 trẻ, phụ thu 100.000đ/đêm. */
export function capacity(room: RoomType, extraBed: boolean) {
  return {
    maxAdults: room.maxAdults + (extraBed ? MAX_EXTRA_BEDS : 0),
    freeChildren: room.maxChildren,
    maxChildren: room.maxChildren + MAX_EXTRA_CHILDREN,
  };
}

export type GuestIssue = "adults" | "children" | "noAdult";

export function checkRoom(room: RoomType, g: RoomGuests): GuestIssue | null {
  const cap = capacity(room, g.extraBed);
  if (g.adults < 1) return "noAdult";
  if (g.adults > cap.maxAdults) return "adults";
  if (g.children < 0 || g.children > cap.maxChildren) return "children";
  return null;
}

export const defaultGuests = (): RoomGuests => ({ adults: 2, children: 0, extraBed: false });

/* ---------------- Lễ, Tết, cao điểm ---------------- */
// GIẢ ĐỊNH (nhóm cần chốt): các dịp này chỉ báo giá tham khảo, nhân viên báo giá riêng.
// Mùa hoa đào tính tháng 1–2, mùa lúa chín tháng 9–10.
const PEAK_FIXED: [string, string][] = [
  ["04-30", "05-01"],
  ["09-02", "09-02"],
  ["12-24", "12-25"],
  ["12-31", "12-31"],
  ["01-01", "01-01"],
];
const PEAK_MONTHS = [1, 2, 9, 10];

export function isPeakNight(iso: string) {
  const md = iso.slice(5);
  if (PEAK_MONTHS.includes(Number(iso.slice(5, 7)))) return true;
  return PEAK_FIXED.some(([a, b]) => md >= a && md <= b);
}
export function stayHasPeak(checkIn: string, checkOut: string) {
  const n = daysBetween(checkIn, checkOut);
  for (let i = 0; i < n; i++) if (isPeakNight(addDays(checkIn, i))) return true;
  return false;
}

/* ---------------- Báo giá ---------------- */

export type LineQuote = {
  roomTypeId: string;
  roomRate: number; // giá phòng/đêm
  extraChildren: number;
  childFeePerNight: number;
  extraBedFeePerNight: number;
  perNight: number;
  total: number; // perNight × số đêm
};

/* ---------------- Dịch vụ đặt kèm ---------------- */
export type EarlyCheckIn = "none" | "before6" | "after6";
export type LateCheckOut = "none" | "before18" | "after18";
export type Extras = { services: { id: string; qty: number }[]; early: EarlyCheckIn; late: LateCheckOut };
export const noExtras = (): Extras => ({ services: [], early: "none", late: "none" });
// Phụ thu theo thẻ Tổng, tính trên giá phòng 1 đêm của các phòng trong đơn
export const EARLY_RATE: Record<EarlyCheckIn, number> = { none: 0, before6: 1, after6: 0.5 };
export const LATE_RATE: Record<LateCheckOut, number> = { none: 0, before18: 0.5, after18: 1 };

export type ExtraLine = { id: string; qty: number; unitPrice: number; total: number };

export type Quote = {
  nights: number;
  lines: LineQuote[];
  total: number; // tổng tiền phòng (căn cứ tính cọc 50% và phí hủy)
  deposit: number;
  services: ExtraLine[];
  earlyFee: number;
  lateFee: number;
  extrasTotal: number; // dịch vụ + nhận sớm/trả muộn, thanh toán tại khách sạn
  grandTotal: number;
  peak: boolean; // có đêm rơi vào lễ, Tết, cao điểm: chỉ là giá tham khảo
};

export function quoteLine(room: RoomType, g: RoomGuests, nights: number): LineQuote {
  const extraChildren = Math.max(0, g.children - room.maxChildren);
  const childFeePerNight = extraChildren * EXTRA_CHILD_FEE;
  const extraBedFeePerNight = g.extraBed ? EXTRA_BED_FEE : 0;
  const perNight = room.pricePerNight + childFeePerNight + extraBedFeePerNight;
  return {
    roomTypeId: room.id,
    roomRate: room.pricePerNight,
    extraChildren,
    childFeePerNight,
    extraBedFeePerNight,
    perNight,
    total: perNight * nights,
  };
}

export function quote(lines: RoomLine[], checkIn: string, checkOut: string, extras: Extras = noExtras()): Quote {
  const nights = daysBetween(checkIn, checkOut);
  const q = lines.map((l) => {
    const room = ROOMS.find((r) => r.id === l.roomTypeId);
    if (!room) throw new Error(`Unknown room type ${l.roomTypeId}`);
    return quoteLine(room, l.guests, nights);
  });
  const total = q.reduce((s, l) => s + l.total, 0);
  const oneNightRooms = q.reduce((s, l) => s + l.roomRate, 0);
  const services: ExtraLine[] = extras.services
    .filter((x) => x.qty > 0)
    .map((x) => {
      const item = serviceById(x.id);
      const unitPrice = item?.price ?? 0;
      return { id: x.id, qty: x.qty, unitPrice, total: unitPrice * x.qty };
    });
  const earlyFee = Math.round(oneNightRooms * EARLY_RATE[extras.early]);
  const lateFee = Math.round(oneNightRooms * LATE_RATE[extras.late]);
  const extrasTotal = services.reduce((s, x) => s + x.total, 0) + earlyFee + lateFee;
  return {
    nights,
    lines: q,
    total,
    deposit: Math.round(total * HOTEL.depositRate),
    services,
    earlyFee,
    lateFee,
    extrasTotal,
    grandTotal: total + extrasTotal,
    peak: stayHasPeak(checkIn, checkOut),
  };
}

/* ---------------- Hủy, đổi ---------------- */

export type CancelPolicy =
  | { allowed: true; daysBefore: number; rate: 0 | 0.5 | 1; fee: number }
  | { allowed: false; daysBefore: number; reason: "SAME_DAY_OR_PAST" };

export function cancellationFee(total: number, checkIn: string, today = todayISO()): CancelPolicy {
  const daysBefore = daysBetween(today, checkIn);
  if (daysBefore < 1) return { allowed: false, daysBefore, reason: "SAME_DAY_OR_PAST" };
  const rate = daysBefore >= FREE_CANCEL_DAYS ? 0 : daysBefore >= HALF_CANCEL_DAYS ? 0.5 : 1;
  return { allowed: true, daysBefore, rate, fee: Math.round(total * rate) };
}

export const canChange = (checkIn: string, today = todayISO()) => daysBetween(today, checkIn) >= MIN_CHANGE_DAYS;

/** Chỉ cho phép tăng hạng (hoặc giữ nguyên) và phải đủ sức chứa cho khách hiện có. */
export const upgradeOptions = (currentId: string, g: RoomGuests) => {
  const cur = ROOMS.find((r) => r.id === currentId);
  return ROOMS.filter((r) => (!cur || r.rank >= cur.rank) && !checkRoom(r, g));
};

export function formatVND(n: number, lang: "vi" | "en") {
  return lang === "vi" ? `${n.toLocaleString("vi-VN")}đ` : `${n.toLocaleString("en-US")} VND`;
}

export function formatDate(iso: string, lang: "vi" | "en") {
  const d = new Date(toUTC(iso));
  return lang === "vi"
    ? d.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" })
    : d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
