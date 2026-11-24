import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";
import { stayHasPeak } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { idToSlug } = await getRoomMapping();

  // Gọi api_kiem_tra_phong_va_gia với p_chi_tiet = null để lấy danh sách phòng trống
  const { data, error } = await supabase.rpc("api_kiem_tra_phong_va_gia", {
    p_ngay_den: checkIn,
    p_ngay_di: checkOut,
    p_chi_tiet: null,
  });

  if (error || !data || !data.success) {
    return NextResponse.json({ error: "NETWORK", message: error?.message }, { status: 500 });
  }

  const rooms = (data.danh_sach_hang_phong || []).map((r: any) => ({
    roomTypeId: idToSlug[r.ma_loai_phong] || "superior",
    available: r.so_phong_trong,
    pricePerNight: Number(r.gia_moi_dem),
  }));

  return NextResponse.json({
    checkIn,
    checkOut,
    peak: stayHasPeak(checkIn, checkOut),
    rooms,
  });
}