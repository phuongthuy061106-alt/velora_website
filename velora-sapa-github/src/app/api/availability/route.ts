import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";
import { stayHasPeak } from "@/lib/pricing";

type RoomItem = {
  ma_loai_phong: number;
  so_phong_trong: number;
  gia_moi_dem: number | string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!checkIn || !checkOut || checkIn >= checkOut) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const { idToSlug } = await getRoomMapping();

  const { data, error } = await supabase.rpc("api_kiem_tra_phong_va_gia", {
    p_ngay_den: checkIn,
    p_ngay_di: checkOut,
    p_chi_tiet: null,
  });

  if (error || !data || !data.success) {
    return NextResponse.json({ error: "NETWORK", message: error?.message }, { status: 500 });
  }

  const roomList = (data.danh_sach_hang_phong || []) as RoomItem[];
  const rooms = roomList.map((r) => ({
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