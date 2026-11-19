// Lớp gọi API đặt phòng (phần C của nhóm).
// Có NEXT_PUBLIC_API_BASE_URL thì gọi API thật; bỏ trống thì dùng dữ liệu giả lưu trong trình duyệt để demo.
import { ROOMS, roomById } from "./hotel";
import {
  canChange,
  cancellationFee,
  checkRoom,
  quote,
  stayHasPeak,
  todayISO,
  type Extras,
  type Quote,
  type RoomLine,
} from "./pricing";

// Trạng thái đơn theo bảng DonDatPhong trong thiết kế CSDL.
export type BookingStatus = "CHO_XAC_NHAN" | "CHO_COC" | "DA_COC" | "DANG_O" | "HOAN_TAT" | "DA_HUY" | "NO_SHOW";

/** Cách khách chọn trả cọc 50%. Website chỉ MÔ PHỎNG, không xử lý tiền thật. */
export type PaymentMethod = "BANK_TRANSFER" | "E_WALLET" | "PAY_LATER";

export type Availability = {
  roomTypeId: string;
  available: number; // số phòng còn trống cho cả khoảng ngày
  pricePerNight: number;
};
export type AvailabilityResult = { checkIn: string; checkOut: string; peak: boolean; rooms: Availability[] };

export type Booking = {
  code: string; // dạng DD000123
  status: BookingStatus;
  checkIn: string;
  checkOut: string;
  rooms: RoomLine[];
  extras: Extras; // dịch vụ đặt kèm, nhận sớm, trả muộn
  fullName: string;
  phone: string;
  email: string;
  note?: string;
  payment: { method: PaymentMethod; depositPaid: number };
  quote: Quote;
  createdAt: string;
  cancelledAt?: string;
  cancelFee?: number;
};

export type NewBooking = {
  checkIn: string;
  checkOut: string;
  rooms: RoomLine[];
  extras: Extras;
  fullName: string;
  phone: string;
  email: string;
  note?: string;
  paymentMethod: PaymentMethod;
};

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "SOLD_OUT"
  | "OVER_CAPACITY"
  | "CANCEL_NOT_ALLOWED"
  | "CHANGE_TOO_LATE"
  | "DOWNGRADE_NOT_ALLOWED"
  | "NOT_CHANGEABLE"
  | "NETWORK";

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message?: string) {
    super(message ?? code);
  }
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");
export const usingMock = !BASE;

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError("NETWORK");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((body.error as ApiErrorCode) ?? "INVALID_INPUT", body.message);
  return body as T;
}

/* ---------------- Dữ liệu giả (chỉ dùng khi chưa có API) ---------------- */
const KEY = "velora.mock.bookings.v3";
const ACTIVE: BookingStatus[] = ["CHO_XAC_NHAN", "CHO_COC", "DA_COC", "DANG_O"];
export const CHANGEABLE: BookingStatus[] = ["CHO_XAC_NHAN", "CHO_COC", "DA_COC"];

const load = (): Booking[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};
const save = (list: Booking[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* bộ nhớ trình duyệt bị chặn: vẫn chạy nhưng không lưu */
  }
};
const normPhone = (p: string) => p.replace(/[^\d]/g, "").replace(/^84/, "0");
const overlaps = (b: Booking, inD: string, outD: string) => b.checkIn < outD && inD < b.checkOut;
const delay = () => new Promise((r) => setTimeout(r, 450));

/** Số phòng còn trống của một hạng trong khoảng ngày (trừ các phòng thuộc đơn exceptCode). */
function mockAvailable(roomTypeId: string, checkIn: string, checkOut: string, exceptCode?: string) {
  const room = roomById(roomTypeId);
  if (!room) return 0;
  const taken = load()
    .filter((b) => b.code !== exceptCode && ACTIVE.includes(b.status) && overlaps(b, checkIn, checkOut))
    .reduce((n, b) => n + b.rooms.filter((l) => l.roomTypeId === roomTypeId).length, 0);
  return Math.max(0, room.inventory - taken);
}

function validateStay(checkIn: string, checkOut: string) {
  if (!(checkIn >= todayISO() && checkOut > checkIn)) throw new ApiError("INVALID_INPUT");
}

function validateLines(lines: RoomLine[], checkIn: string, checkOut: string, exceptCode?: string) {
  if (!lines.length) throw new ApiError("INVALID_INPUT");
  for (const l of lines) {
    const room = roomById(l.roomTypeId);
    if (!room) throw new ApiError("INVALID_INPUT");
    if (checkRoom(room, l.guests)) throw new ApiError("OVER_CAPACITY");
  }
  const need = new Map<string, number>();
  lines.forEach((l) => need.set(l.roomTypeId, (need.get(l.roomTypeId) ?? 0) + 1));
  for (const [id, n] of need) if (mockAvailable(id, checkIn, checkOut, exceptCode) < n) throw new ApiError("SOLD_OUT");
}

function findOwned(code: string, phone: string) {
  const list = load();
  const b = list.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  // Sai mã hay sai số điện thoại đều trả NOT_FOUND để không lộ đơn của người khác.
  if (!b || normPhone(b.phone) !== normPhone(phone)) throw new ApiError("NOT_FOUND");
  return { list, b };
}

/* ---------------- Hàm công khai ---------------- */

/** Bước 1: chỉ cần ngày ở, trả về số phòng trống của từng hạng. */
export async function searchAvailability(checkIn: string, checkOut: string): Promise<AvailabilityResult> {
  if (BASE) return call<AvailabilityResult>(`/availability?${new URLSearchParams({ checkIn, checkOut })}`);
  await delay();
  validateStay(checkIn, checkOut);
  return {
    checkIn,
    checkOut,
    peak: stayHasPeak(checkIn, checkOut),
    rooms: ROOMS.map((r) => ({
      roomTypeId: r.id,
      available: mockAvailable(r.id, checkIn, checkOut),
      pricePerNight: r.pricePerNight,
    })),
  };
}

export async function createBooking(input: NewBooking): Promise<Booking> {
  if (BASE) return call<Booking>("/bookings", { method: "POST", body: JSON.stringify(input) });
  await delay();
  validateStay(input.checkIn, input.checkOut);
  validateLines(input.rooms, input.checkIn, input.checkOut);
  const list = load();
  const q = quote(input.rooms, input.checkIn, input.checkOut, input.extras);
  const paidNow = input.paymentMethod !== "PAY_LATER";
  const { paymentMethod, ...rest } = input;
  const booking: Booking = {
    ...rest,
    code: `DD${String(1000 + list.length + 1).padStart(6, "0")}`,
    // Cọc ngay (mô phỏng) → "Đã đặt cọc"; nhận hướng dẫn sau → "Chờ xác nhận", nhân viên gửi hướng dẫn thanh toán.
    status: paidNow ? "DA_COC" : "CHO_XAC_NHAN",
    payment: { method: paymentMethod, depositPaid: paidNow ? q.deposit : 0 },
    quote: q,
    createdAt: new Date().toISOString(),
  };
  save([...list, booking]);
  return booking;
}

export async function lookupBooking(code: string, phone: string): Promise<Booking> {
  if (BASE) return call<Booking>("/bookings/lookup", { method: "POST", body: JSON.stringify({ code, phone }) });
  await delay();
  return findOwned(code, phone).b;
}

export async function cancelBooking(code: string, phone: string): Promise<Booking> {
  if (BASE) return call<Booking>(`/bookings/${encodeURIComponent(code)}/cancel`, { method: "POST", body: JSON.stringify({ phone }) });
  await delay();
  const { list, b } = findOwned(code, phone);
  if (!CHANGEABLE.includes(b.status)) throw new ApiError("NOT_CHANGEABLE");
  const policy = cancellationFee(b.quote.total, b.checkIn);
  if (!policy.allowed) throw new ApiError("CANCEL_NOT_ALLOWED");
  const updated: Booking = { ...b, status: "DA_HUY", cancelledAt: new Date().toISOString(), cancelFee: policy.fee };
  save(list.map((x) => (x.code === b.code ? updated : x)));
  return updated;
}

/** Đổi ngày ở và/hoặc nâng hạng từng phòng. Khách trong mỗi phòng giữ nguyên. */
export async function changeBooking(
  code: string,
  phone: string,
  change: { checkIn: string; checkOut: string; roomTypeIds: string[] },
): Promise<Booking> {
  if (BASE)
    return call<Booking>(`/bookings/${encodeURIComponent(code)}/change`, {
      method: "POST",
      body: JSON.stringify({ phone, ...change }),
    });
  await delay();
  const { list, b } = findOwned(code, phone);
  if (!CHANGEABLE.includes(b.status)) throw new ApiError("NOT_CHANGEABLE");
  if (!canChange(b.checkIn)) throw new ApiError("CHANGE_TOO_LATE");
  validateStay(change.checkIn, change.checkOut);
  if (change.roomTypeIds.length !== b.rooms.length) throw new ApiError("INVALID_INPUT");
  const lines: RoomLine[] = b.rooms.map((l, i) => {
    const cur = roomById(l.roomTypeId);
    const next = roomById(change.roomTypeIds[i]);
    if (!cur || !next) throw new ApiError("INVALID_INPUT");
    if (next.rank < cur.rank) throw new ApiError("DOWNGRADE_NOT_ALLOWED");
    return { roomTypeId: next.id, guests: l.guests };
  });
  validateLines(lines, change.checkIn, change.checkOut, b.code);
  const updated: Booking = {
    ...b,
    checkIn: change.checkIn,
    checkOut: change.checkOut,
    rooms: lines,
    status: "CHO_XAC_NHAN",
    quote: quote(lines, change.checkIn, change.checkOut, b.extras),
  };
  save(list.map((x) => (x.code === b.code ? updated : x)));
  return updated;
}
