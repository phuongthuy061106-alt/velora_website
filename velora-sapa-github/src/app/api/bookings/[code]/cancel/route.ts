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

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { phone, reason } = await req.json();

  const supabase = getServiceSupabase();

  // 1. Gọi hàm hủy đơn trên Supabase
  const { data: cancelRes, error: cancelErr } = await supabase.rpc("api_huy_don", {
    p_ma_don_hien_thi: code.trim(),
    p_so_dien_thoai: phone.trim(),
    p_ly_do_huy: reason || "Khách yêu cầu hủy qua website",
  });

  if (cancelErr || !cancelRes || !cancelRes.success) {
    return NextResponse.json(
      { error: "CANCEL_NOT_ALLOWED", message: cancelRes?.error || cancelErr?.message },
      { status: 400 }
    );
  }

  // 2. Tra cứu lại đầy đủ thông tin đơn sau khi hủy để web hiển thị
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

  const fullQuote = quote(rooms, data?.ngay_den || "2026-11-26", data?.ngay_di || "2026-11-30", extras);

  return NextResponse.json({
    code: data?.ma_don || cancelRes.ma_don,
    status: "DA_HUY",
    checkIn: data?.ngay_den,
    checkOut: data?.ngay_di,
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
    cancelFee: Number(cancelRes.phi_huy_ap_dung || data?.phi_huy || 0),
    cancelledAt: new Date().toISOString(),
  });
}