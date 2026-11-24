import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";
import { stayHasPeak } from "@/lib/pricing";
import { ROOMS } from "@/lib/hotel";

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

  try {
    // Gọi đúng hàm api_bao_gia ở chế độ 'liet_ke' (p_chi_tiet = null)
    const { data, error } = await supabase.rpc("api_bao_gia", {
      p_ngay_den: checkIn,
      p_ngay_di: checkOut,
      p_chi_tiet: null,
      p_so_nguoi_lon: 2,
      p_so_tre_duoi_6: 0,
      p_so_tre_6_11: 0,
    });

    if (!error && data && data.success && data.danh_sach_hang_phong) {
      const roomList = data.danh_sach_hang_phong as RoomItem[];
      const rooms = roomList.map((r) => ({
        roomTypeId: idToSlug[r.ma_loai_phong] || "superior",
        available: Number(r.so_phong_trong ?? 10),
        pricePerNight: Number(r.gia_moi_dem ?? 1400000),
      }));

      return NextResponse.json({
        checkIn,
        checkOut,
        peak: stayHasPeak(checkIn, checkOut),
        rooms,
      });
    }

    // Cơ chế dự phòng nếu bảng giá ngày đó chưa thiết lập
    console.warn("api_bao_gia notice:", error?.message || data?.error);
    return NextResponse.json({
      checkIn,
      checkOut,
      peak: stayHasPeak(checkIn, checkOut),
      rooms: ROOMS.map((r) => ({ roomTypeId: r.id, available: r.inventory, pricePerNight: r.pricePerNight })),
    });
  } catch (err: unknown) {
    console.error("Availability error:", err);
    return NextResponse.json({
      checkIn,
      checkOut,
      peak: stayHasPeak(checkIn, checkOut),
      rooms: ROOMS.map((r) => ({ roomTypeId: r.id, available: r.inventory, pricePerNight: r.pricePerNight })),
    });
  }
}