import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";
import { quote } from "@/lib/pricing";
import type { NewBooking } from "@/lib/booking-api";

export async function POST(req: NextRequest) {
  try {
    const body: NewBooking = await req.json();
    const { checkIn, checkOut, rooms, extras, fullName, phone, email, note, paymentMethod } = body;

    const { slugToId } = await getRoomMapping();

    const roomCountMap = new Map<number, number>();
    let totalAdults = 0;
    let totalKids = 0;

    for (const r of rooms) {
      const typeId = slugToId[r.roomTypeId] || 1;
      roomCountMap.set(typeId, (roomCountMap.get(typeId) || 0) + 1);
      totalAdults += r.guests.adults;
      totalKids += r.guests.children;
    }

    const p_chi_tiet = Array.from(roomCountMap.entries()).map(([ma_loai_phong, so_luong]) => ({
      ma_loai_phong,
      so_luong,
    }));

    const supabase = getServiceSupabase();

    const { data, error } = await supabase.rpc("api_tao_don", {
      p_ten_khach_hang: fullName.trim(),
      p_so_dien_thoai: phone.trim(),
      p_email: email.trim(),
      p_nguon_tao: "WEBSITE",
      p_ngay_den: checkIn,
      p_ngay_di: checkOut,
      p_chi_tiet,
      p_so_nguoi_lon: totalAdults,
      p_so_tre_duoi_6: 0,
      p_so_tre_6_11: totalKids,
      p_ghi_chu: note?.trim() || null,
    });

    if (error || !data || !data.success) {
  const errMsg = data?.error || error?.message || "Lỗi tạo đơn";
  console.error("Lỗi Supabase:", errMsg);
  // Trả về thẳng thông báo của Supabase để giao diện hiển thị cho bạn đọc
  return NextResponse.json({ error: errMsg, message: errMsg }, { status: 400 });
}

    const bookingQuote = quote(rooms, checkIn, checkOut, extras);
    const paidNow = paymentMethod !== "PAY_LATER";

    await supabase
      .from("don_dat_phong")
      .update({
        extras: extras || {},
        ...(paidNow
          ? {
              trang_thai: "DA_COC",
              tien_coc: data.tien_coc_yeu_cau_50_phan_tram || bookingQuote.deposit,
            }
          : {}),
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
        depositPaid: paidNow ? Number(data.tien_coc_yeu_cau_50_phan_tram) : 0,
      },
      quote: bookingQuote,
      createdAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đầu vào không hợp lệ";
    return NextResponse.json({ error: "INVALID_INPUT", message }, { status: 400 });
  }
}