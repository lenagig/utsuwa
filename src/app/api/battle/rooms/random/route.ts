import { NextResponse } from "next/server";
import { getRequestUserId, getSupabaseAdmin } from "@/lib/supabase-server";

function roomCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

export async function POST(request: Request) {
  const userId = await getRequestUserId(request);
  const admin = getSupabaseAdmin();
  const body = await request.json().catch(() => null) as { vesselId?: unknown } | null;
  const vesselId = typeof body?.vesselId === "string" ? body.vesselId : "";
  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  if (!admin || !vesselId) return NextResponse.json({ error: "対戦の準備に失敗しました。" }, { status: 400 });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: waiting } = await admin.from("battle_rooms").select("id")
      .eq("status", "waiting").is("guest_user_id", null).neq("host_user_id", userId)
      .order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (!waiting) break;
    const { data: joined } = await admin.from("battle_rooms")
      .update({ guest_user_id: userId, guest_vessel_id: vesselId, status: "matched", matched_at: new Date().toISOString() })
      .eq("id", waiting.id).eq("status", "waiting").is("guest_user_id", null)
      .select("id, room_code, status, host_vessel_id, guest_vessel_id").maybeSingle();
    if (joined) return NextResponse.json({ room: joined, state: "matched" });
  }

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data: created, error } = await admin.from("battle_rooms")
      .insert({ room_code: roomCode(), host_user_id: userId, host_vessel_id: vesselId })
      .select("id, room_code, status, host_vessel_id, guest_vessel_id").single();
    if (created) return NextResponse.json({ room: created, state: "waiting" });
    if (error?.code !== "23505") break;
  }
  return NextResponse.json({ error: "部屋を作成できませんでした。" }, { status: 500 });
}
