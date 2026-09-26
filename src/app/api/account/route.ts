import { NextResponse } from "next/server";
import { getJapanDate } from "@/lib/japan-date";
import { getRequestUserId, getSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const userId = await getRequestUserId(request);
  const supabase = getSupabaseAdmin();

  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Supabaseが未設定です。" }, { status: 503 });

  const today = getJapanDate();
  const [profileResult, unlockedResult, statsResult] = await Promise.all([
    supabase.from("profiles").select("username, location").eq("id", userId).single(),
    supabase.from("unlocked_vessels").select("vessel_id").eq("user_id", userId),
    supabase.from("daily_vessel_stats").select("created_count").eq("stat_date", today).maybeSingle(),
  ]);

  if (profileResult.error || unlockedResult.error || statsResult.error) {
    console.error("Failed to load Supabase account data", {
      profile: profileResult.error,
      unlockedVessels: unlockedResult.error,
      dailyStats: statsResult.error,
    });
    return NextResponse.json({ error: "アカウント情報を取得できませんでした。" }, { status: 500 });
  }

  return NextResponse.json({
    profile: profileResult.data,
    unlockedVesselIds: unlockedResult.data.map((row: { vessel_id: string }) => row.vessel_id),
    nationalTodayCount: statsResult.data?.created_count ?? 0,
  });
}
