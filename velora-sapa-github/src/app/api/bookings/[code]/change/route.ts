import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { getRoomMapping } from "@/lib/room-mapper";
import { quote } from "@/lib/pricing";

type ChiTietPhongItem = {
  ten_loai_phong?: string;
  so_nguoi_lon: number;
  so_tre_duoi_6: number;
  so_tre_6_11: number;
  so_giuong_phu: number;
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { phone, checkIn, checkOut, roomTypeIds } = await req.json();

  const { slugToId } = await getRoomMapping();
  const supabase = getServiceSupabase();

  const targetRoomId = roomTypeIds?.[0] ? slugToId[roomTypeIds[0]] : null;

  // 1. Gọi hàm đổi đơn trên Supabase
  const { data: changeRes, error: changeErr } = await supabase.rpc("api_doi_don", {
    p_ma_don_hien_thi: code.trim(),
    p_so_dien_thoai: phone.trim(),
    p_ngay_den_moi: checkIn,
    p_ngay_di_moi: checkOut,
    p_ma_loai_phong_moi: targetRoomId,
    p_ghi_chu: "Đổi đơn qua website",
  });

  if (changeErr || !changeRes || !changeRes.success) {
    return NextResponse.json(
      { error: "NOT_CHANGEABLE", message: changeRes?.error || changeErr?.message },
      { status: 400 }
    );
  }

  // 2. Tra cứu lại thông tin đơn sau khi đổi
  const { data } = await supabase.rpc("api_tra_cuu_don", {
    p_ma_don_hien_thi: code.trim(),
    p_so_dien_thoai: phone.trim(),
  });

  const { data: donExtra } = await supabase
    .from("don_dat_phong")
    .select("extras")
    .eq("ma_don_hien_thi", code.trim())
    .single();

  const extras = donExtra?.extras || { services: [], early: "none", late: "none" };

  const rawRooms = ((data?.chi_tiet_phong as ChiTietPhongItem[]) || []);
  const rooms = rawRooms.map((ct) => {
    let slug = "superior";
    const name = (ct.ten_loai_phong || "").toLowerCase();
    if (name.includes("deluxe")) slug = "deluxe-mountain-view";
    else if (name.includes("family")) slug = "family-room";
    else if (name.includes("suite") || name.includes("executive")) slug = "executive-suite";

    return {
      roomTypeId: slug,
      guests: {
        adults: ct.so_nguoi_lon,
        children: ct.so_tre_duoi_6 + ct.so_tre_6_11,
        extraBed: ct.so_giuong_phu > 0,
      },
    };
  });

  const fullQuote = quote(rooms, checkIn, checkOut, extras);

  return NextResponse.json({
    code: data?.ma_don || changeRes.ma_don,
    status: "CHO_XAC_NHAN",
    checkIn,
    checkOut,
    rooms,
    extras,
    fullName: data?.ten_khach_hang || "",
    phone: data?.so_dien_thoai || phone,
    email: data?.email || "",
    payment: {
      method: "BANK_TRANSFER",
      depositPaid: Number(data?.tien_coc || 0),
    },
    quote: fullQuote,
    createdAt: new Date().toISOString(),
  });
}