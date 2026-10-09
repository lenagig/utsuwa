import { NextResponse } from "next/server";
import { vessels } from "@/data/vessels";
import { getRequestUserId, getSupabaseAdmin } from "@/lib/supabase-server";

type RouteContext = { params: Promise<{ vesselId: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const userId = await getRequestUserId(request);
  const supabase = getSupabaseAdmin();
  const { vesselId } = await params;

  if (!userId) return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  if (!supabase) return NextResponse.json({ error: "Supabaseが未設定です。" }, { status: 503 });
  if (!vessels.some((vessel) => vessel.id === vesselId)) return NextResponse.json({ error: "存在しない器です。" }, { status: 404 });

  const unlocked = await supabase.from("unlocked_vessels").select("vessel_id").eq("user_id", userId).eq("vessel_id", vesselId).maybeSingle();
  if (unlocked.error) return NextResponse.json({ error: "図鑑の状態を確認できませんでした。" }, { status: 500 });
  if (!unlocked.data) return NextResponse.json({ error: "この器は未解放です。" }, { status: 403 });

  const examples = await supabase
    .from("vessel_creations")
    .select("input_text")
    .eq("vessel_id", vesselId)
    .neq("user_id", userId)
    .not("input_text", "is", null)
    .neq("input_text", "")
    .order("created_at", { ascending: false })
    .limit(6);
  if (examples.error) return NextResponse.json({ error: "みんなの入力例を取得できませんでした。" }, { status: 500 });

  return NextResponse.json({ examples: examples.data.map((row) => ({ text: row.input_text as string })) });
}
