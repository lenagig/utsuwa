import { NextResponse } from "next/server";
import { getRequestUserId, getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const userId = await getRequestUserId(request);
  const admin = getSupabaseAdmin();
  const body = await request.json().catch(() => null) as { roomCode?: unknown; vesselId?: unknown } | null;
  const roomCode = typeof body?.roomCode === "string" ? body.roomCode.trim().toUpperCase() : "";
  const vesselId = typeof body?.vesselId === "string" ? body.vesselId : "";
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  if (!admin || !/^[A-Z0-9]{6}$/.test(roomCode) || !vesselId) return NextResponse.json({ error: "6文字の部屋番号を入力してください。" }, { status: 400 });

  const { data: room } = await admin.from("battle_rooms").select("id, host_user_id").eq("room_code", roomCode).maybeSingle();
  if (!room) return NextResponse.json({ error: "その部屋は見つかりません。" }, { status: 404 });
  if (room.host_user_id === userId) return NextResponse.json({ error: "自分が作成した部屋には入れません。" }, { status: 409 });
  const { data: joined } = await admin.from("battle_rooms")
    .update({ guest_user_id: userId, guest_vessel_id: vesselId, status: "matched", matched_at: new Date().toISOString() })
    .eq("id", room.id).eq("status", "waiting").is("guest_user_id", null)
    .select("id, room_code, status, host_vessel_id, guest_vessel_id").maybeSingle();
  if (!joined) return NextResponse.json({ error: "この部屋はすでに対戦中です。" }, { status: 409 });
  return NextResponse.json({ room: joined, state: "matched" });
}
