"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Vessel } from "@/types/vessel";
import screen from "@/components/Screen.module.css";
import styles from "@/components/ResultScreen.module.css";

type ResultScreenProps = {
  irritationText: string;
  onBattle: () => void;
  vessel: Vessel;
  onBack: () => void;
  showOwner?: boolean;
};

export function ResultScreen({ irritationText, onBattle, vessel, onBack, showOwner = true }: ResultScreenProps) {
  const [examples, setExamples] = useState<string[]>([]);
  const [examplesState, setExamplesState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    async function loadExamples() {
      const session = (await getSupabaseBrowserClient()?.auth.getSession())?.data.session;
      if (!session) {
        if (!cancelled) setExamplesState("error");
        return;
      }
      const response = await fetch(`/api/vessels/${encodeURIComponent(vessel.id)}/examples`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) {
        if (!cancelled) setExamplesState("error");
        return;
      }
      const data = (await response.json()) as { examples?: Array<{ text?: string }> };
      if (!cancelled) {
        setExamples((data.examples ?? []).map((example) => example.text ?? "").filter(Boolean));
        setExamplesState("ready");
      }
    }
    void loadExamples();
    return () => { cancelled = true; };
  }, [vessel.id]);

  return (
    <main className={`${screen.titlePage} ${styles.resultPage}`}>
      <div className={screen.screenContent}>
        <section className={`${screen.titlePanel} ${styles.resultPanel}`} aria-labelledby="result-title">
          {showOwner && <p className={styles.resultOwner}>{irritationText || "あなた"}の器は</p>}
          <div className={styles.vesselResultImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={vessel.name} src={vessel.imageUrl} />
          </div>
          <h1 className={styles.resultTitle} id="result-title">{vessel.name}</h1>
          <p className={styles.resultFeature}>{vessel.feature}</p>

          <section className={styles.examples} aria-label="みんなの入力例">
            <h2>この器になった、みんなのイライラ</h2>
            {examplesState === "loading" && <p>入力例を読み込み中…</p>}
            {examplesState === "error" && <p>入力例を読み込めませんでした。</p>}
            {examplesState === "ready" && (examples.length > 0
              ? <ul>{examples.map((example, index) => <li key={`${example}-${index}`}>{example}</li>)}</ul>
              : <p>まだこの器の入力例はありません。最初の一例を残してみよう。</p>)}
          </section>

          <div className={styles.resultActions}>
            <button className={screen.primaryAction} onClick={onBattle} type="button">この器でバトルする</button>
            <button className={screen.secondaryAction} onClick={onBack} type="button">戻る</button>
          </div>
        </section>
      </div>
    </main>
  );
}
