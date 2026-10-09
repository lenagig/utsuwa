import { NextResponse } from "next/server";
import { getRequestUserId, getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
  const userId = await getRequestUserId(request);
  const admin = getSupabaseAdmin();
  const { roomId } = await params;
  if (!userId || !admin) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  const { data: room } = await admin.from("battle_rooms")
    .select("id, room_code, host_user_id, guest_user_id, host_vessel_id, guest_vessel_id, status")
    .eq("id", roomId).maybeSingle();
  if (!room || (room.host_user_id !== userId && room.guest_user_id !== userId)) return NextResponse.json({ error: "部屋が見つかりません。" }, { status: 404 });
  return NextResponse.json({ room });
}
