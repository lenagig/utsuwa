import { NextResponse } from "next/server";
import { vessels } from "@/data/vessels";

export async function POST(request: Request) {
  const { inputText } = (await request.json()) as { inputText?: unknown };

  if (typeof inputText !== "string" || inputText.length > 1000) {
    return NextResponse.json({ error: "入力内容を確認してください。" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY が未設定です。" }, { status: 503 });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  const catalog = vessels.map(({ id, name, feature }) => ({ id, name, feature }));
  const prompt = [
    "あなたは『器』アプリの図鑑司書です。",
    "ユーザーが遭遇した人・行動の内容から、図鑑内で最も合う器を1つだけ選んでください。",
    "必ず次の候補の id のみを返してください。説明や記号は不要です。",
    `候補: ${JSON.stringify(catalog)}`,
    `入力: ${inputText.trim() || "内容なし"}`
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );

  if (!response.ok) {
    return NextResponse.json({ error: "Geminiの選択に失敗しました。" }, { status: 502 });
  }

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const answer = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
  const vessel = vessels.find((candidate) => candidate.id === answer);

  if (!vessel) {
    return NextResponse.json({ error: "Geminiの選択結果を確認できませんでした。" }, { status: 502 });
  }

  return NextResponse.json({ vesselId: vessel.id });
}
