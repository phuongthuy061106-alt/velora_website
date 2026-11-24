import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";
import { quote } from "@/lib/pricing";
import { roomById } from "@/lib/hotel";
import type { NewBooking } from "@/lib/booking-api";

export async function POST(req: NextRequest) {
  try {
    const body: NewBooking = await req.json();
    const { checkIn, checkOut, rooms, extras, fullName, phone, email, note, paymentMethod } = body;

    const { slugToId } = await getRoomMapping();

    const roomCountMap = new Map<number, number>();
    let totalAdults = 0;
    let freeKids = 0;
    let extraKids = 0;

    // Phân loại trẻ em: trẻ trong sức chứa tiêu chuẩn (miễn phí) và trẻ phụ thu (+100k)
    for (const r of rooms) {
      const typeId = slugToId[r.roomTypeId] || 1;
      roomCountMap.set(typeId, (roomCountMap.get(typeId) || 0) + 1);
      totalAdults += r.guests.adults;

      const roomDef = roomById(r.roomTypeId);
      const standardKids = roomDef ? roomDef.maxChildren : 1;

      // Số trẻ miễn phí trong tiêu chuẩn
      freeKids += Math.min(r.guests.children, standardKids);
      // Số trẻ vượt tiêu chuẩn (phụ thu 100k/đêm)
      extraKids += Math.max(0, r.guests.children - standardKids);
    }

    const p_chi_tiet = Array.from(roomCountMap.entries()).map(([ma_loai_phong, so_luong]) => ({
      ma_loai_phong,
      so_luong,
    }));

    const supabase = getServiceSupabase();

    // 1. Gọi hàm api_tao_don tạo đơn trong DB
    const { data, error } = await supabase.rpc("api_tao_don", {
      p_ten_khach_hang: fullName.trim(),
      p_so_dien_thoai: phone.trim(),
      p_email: email.trim(),
      p_nguon_tao: "WEBSITE",
      p_ngay_den: checkIn,
      p_ngay_di: checkOut,
      p_chi_tiet,
      p_so_nguoi_lon: totalAdults,
      p_so_tre_duoi_6: freeKids,   // Trẻ em miễn phí
      p_so_tre_6_11: extraKids,    // Trẻ em phụ thu 100k
      p_ghi_chu: note?.trim() || null,
    });

    if (error || !data || !data.success) {
      const errMsg = data?.error || error?.message || "Lỗi tạo đơn";
      return NextResponse.json({ error: errMsg, message: errMsg }, { status: 400 });
    }

    // 2. Tính báo giá chuẩn xác theo quy chế khách sạn
    const bookingQuote = quote(rooms, checkIn, checkOut, extras);
    const paidNow = paymentMethod !== "PAY_LATER";

    // 3. Đồng bộ lại đúng tổng tiền phòng và cọc 50% vào CSDL Supabase
    await supabase
      .from("don_dat_phong")
      .update({
        tong_tien_phong: bookingQuote.total,
        tien_coc: paidNow ? bookingQuote.deposit : 0,
        extras: extras || {},
        trang_thai: paidNow ? "DA_COC" : "CHO_XAC_NHAN",
      })
      .eq("ma_don_hien_thi", data.ma_don);

    return NextResponse.json({
      code: data.ma_don,
      status: paidNow ? "DA_COC" : "CHO_XAC_NHAN",
      checkIn: data.ngay_den,
      checkOut: data.ngay_di,
      rooms,
      extras,
      fullName,
      phone,
      email,
      note,
      payment: {
        method: paymentMethod,
        depositPaid: paidNow ? bookingQuote.deposit : 0,
      },
      quote: bookingQuote,
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đầu vào không hợp lệ";
    return NextResponse.json({ error: message, message }, { status: 400 });
  }
}