import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { phone, reason } = await req.json();

  const supabase = getServiceSupabase();

  const { data, error } = await supabase.rpc("api_huy_don", {
    p_ma_don_hien_thi: code.trim(),
    p_so_dien_thoai: phone.trim(),
    p_ly_do_huy: reason || "Khách yêu cầu hủy qua website",
  });

  if (error || !data || !data.success) {
    return NextResponse.json({ error: "CANCEL_NOT_ALLOWED", message: data?.error }, { status: 400 });
  }

  return NextResponse.json({
    code: data.ma_don,
    status: "DA_HUY",
    cancelledAt: new Date().toISOString(),
    cancelFee: Number(data.phi_huy_ap_dung || 0),
  });
}