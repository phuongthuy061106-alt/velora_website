import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { phone, checkIn, checkOut, roomTypeIds } = await req.json();

  const { slugToId } = await getRoomMapping();
  const supabase = getServiceSupabase();

  const targetRoomId = roomTypeIds?.[0] ? slugToId[roomTypeIds[0]] : null;

  const { data, error } = await supabase.rpc("api_doi_don", {
    p_ma_don_hien_thi: code.trim(),
    p_so_dien_thoai: phone.trim(),
    p_ngay_den_moi: checkIn,
    p_ngay_di_moi: checkOut,
    p_ma_loai_phong_moi: targetRoomId,
    p_ghi_chu: "Đổi đơn qua website",
  });

  if (error || !data || !data.success) {
    return NextResponse.json(
      { error: "NOT_CHANGEABLE", message: data?.error || error?.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    code: data.ma_don,
    status: "CHO_XAC_NHAN",
    checkIn: data.ngay_den_moi,
    checkOut: data.ngay_di_moi,
    total: Number(data.tong_tien_phong_moi),
  });
}