import { NextResponse } from "next/server";
import { vessels } from "@/data/vessels";
import { getJapanDate } from "@/lib/japan-date";
import { getRequestUserId, getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const { inputText } = (await request.json()) as { inputText?: unknown };
  if (typeof inputText !== "string" || inputText.length > 1000) {
    return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const userId = await getRequestUserId(request);
  if (!userId) return NextResponse.json({ error: "器を生み出すにはログインが必要です。" }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEYが未設定です。" }, { status: 503 });

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const catalog = vessels.map(({ id, name, feature }) => ({ id, name, feature }));
  const prompt = [
    "あなたは『器』アプリの図鑑選定員です。",
    "ユーザーが出会った人物・行動の説明から、器を必ず1つだけ選んでください。",
    "必ず次の候補の id だけを返してください。説明・記号・改行は不要です。",
    `候補: ${JSON.stringify(catalog)}`,
    `入力: ${inputText.trim() || "まだ言葉にできない人だった"}`,
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    },
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Geminiの選定に失敗しました。" }, { status: 502 });
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const answer = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  const vessel = vessels.find((candidate) => candidate.id === answer);
  if (!vessel) return NextResponse.json({ error: "Geminiの選定結果を確認できませんでした。" }, { status: 502 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: "Supabaseが未設定です。" }, { status: 503 });

  const [unlockResult, creationResult, counterResult] = await Promise.all([
    supabase.from("unlocked_vessels").upsert(
      { user_id: userId, vessel_id: vessel.id },
      { onConflict: "user_id,vessel_id", ignoreDuplicates: true },
    ),
    supabase.from("vessel_creations").insert({ user_id: userId, vessel_id: vessel.id }),
    supabase.rpc("increment_daily_vessel_count", { p_stat_date: getJapanDate() }),
  ]);

  if (unlockResult.error || creationResult.error || counterResult.error) {
    console.error("Failed to save vessel creation", {
      unlock: unlockResult.error,
      creation: creationResult.error,
      counter: counterResult.error,
    });
    return NextResponse.json({ error: "図鑑または全国集計の保存に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({
    vesselId: vessel.id,
    nationalTodayCount: counterResult.data as number,
  });
}
