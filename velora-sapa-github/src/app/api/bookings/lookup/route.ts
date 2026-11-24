import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { quote } from "@/lib/pricing";

type ChiTietPhongItem = {
  ten_loai_phong?: string;
  so_nguoi_lon: number;
  so_tre_duoi_6: number;
  so_tre_6_11: number;
  so_giuong_phu: number;
};

export async function POST(req: NextRequest) {
  const { code, phone } = await req.json();
  const supabase = getServiceSupabase();

  const { data, error } = await supabase.rpc("api_tra_cuu_don", {
    p_ma_don_hien_thi: code.trim(),
    p_so_dien_thoai: phone.trim(),
  });

  if (error || !data || !data.success) {
    return NextResponse.json({ error: "NOT_FOUND", message: data?.error }, { status: 404 });
  }

  const { data: donExtra } = await supabase
    .from("don_dat_phong")
    .select("extras")
    .eq("ma_don_hien_thi", data.ma_don)
    .single();

  const extras = donExtra?.extras || { services: [], early: "none", late: "none" };

  const rawRooms = (data.chi_tiet_phong || []) as ChiTietPhongItem[];
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

  const fullQuote = quote(rooms, data.ngay_den, data.ngay_di, extras);

  return NextResponse.json({
    code: data.ma_don,
    status: data.trang_thai,
    checkIn: data.ngay_den,
    checkOut: data.ngay_di,
    rooms,
    extras,
    fullName: data.ten_khach_hang,
    phone: data.so_dien_thoai,
    email: data.email || "",
    payment: {
      method: "BANK_TRANSFER",
      depositPaid: Number(data.tien_coc || 0),
    },
    quote: fullQuote,
    cancelFee: data.phi_huy ? Number(data.phi_huy) : undefined,
    createdAt: new Date().toISOString(),
  });
}