"use client";

import { useMemo, useState } from "react";
import { BattleArena3D, type BattlePhase } from "@/components/BattleArena3D";
import type { Vessel } from "@/types/vessel";
import screen from "@/components/Screen.module.css";
import styles from "@/components/BattleScreen.module.css";

type BattleScreenProps = {
  onBack: () => void;
  onSelectVessel: (vesselId: string) => void;
  vessels: Vessel[];
  selectedVessel: Vessel | null;
};

type Result = { loser: "player" | "rival"; winner: "player" | "rival" } | null;

export function BattleScreen({ onBack, onSelectVessel, vessels, selectedVessel }: BattleScreenProps) {
  const [phase, setPhase] = useState<BattlePhase>("idle");
  const [rival, setRival] = useState<Vessel | null>(null);
  const [result, setResult] = useState<Result>(null);
  const isFighting = phase !== "idle" && phase !== "result";

  const rivalLabel = useMemo(() => rival?.name ?? "対戦相手を待っています", [rival]);

  function startBattle() {
    if (!selectedVessel || isFighting) return;
    const candidates = vessels.filter((vessel) => vessel.id !== selectedVessel.id);
    const opponent = candidates[Math.floor(Math.random() * candidates.length)] ?? selectedVessel;
    const playerScore = selectedVessel.attack + selectedVessel.hp * 0.42 + Math.random() * 14;
    const rivalScore = opponent.attack + opponent.hp * 0.42 + Math.random() * 14;
    const nextResult: Result = playerScore >= rivalScore ? { winner: "player", loser: "rival" } : { winner: "rival", loser: "player" };
    setRival(opponent);
    setResult(null);
    setPhase("windup");
    window.setTimeout(() => setPhase("throw"), 760);
    window.setTimeout(() => setPhase("impact"), 1700);
    window.setTimeout(() => { setResult(nextResult); setPhase("result"); }, 2220);
  }

  const message = result
    ? result.winner === "player" ? "勝利。相手の器が中央で砕け散った。" : "敗北。あなたの器が中央で砕け散った。"
    : isFighting ? "器が闘技場の中央へ飛んでいく……" : "器を選び、闘技場へ。";

  return (
    <main className={`${screen.titlePage} ${styles.battlePage}`}>
      <div className={styles.arena}><BattleArena3D loser={result?.loser ?? null} phase={phase} player={selectedVessel} rival={rival} /></div>
      <div className={styles.hud}>
        <header className={styles.heading}><span>UTSUWA ARENA</span><h1>バトル</h1><p>赤と青、ふたつの器がぶつかる。</p></header>
        <section className={styles.statusCard} aria-live="polite">
          <div className={styles.combatants}>
            <div><span className={styles.redMark}>PLAYER</span><strong>{selectedVessel?.name ?? "器を選んでください"}</strong><small>HP {selectedVessel?.hp ?? "--"}　ATK {selectedVessel?.attack ?? "--"}</small></div>
            <b>VS</b>
            <div className={styles.rival}><span className={styles.blueMark}>RIVAL</span><strong>{rivalLabel}</strong><small>{rival ? `HP ${rival.hp}　ATK ${rival.attack}` : "戦闘開始時に決定"}</small></div>
          </div>
          <p className={styles.battleMessage}>{message}</p>
        </section>
        <section className={styles.controls}>
          <label htmlFor="battle-vessel">あなたの器</label>
          <div className={styles.vesselSelectWrap}><select className={styles.vesselSelect} disabled={vessels.length === 0 || isFighting} id="battle-vessel" onChange={(event) => { onSelectVessel(event.target.value); setRival(null); setResult(null); setPhase("idle"); }} value={selectedVessel?.id ?? ""}>{vessels.length === 0 ? <option value="">解放済みの器がありません</option> : vessels.map((vessel) => <option key={vessel.id} value={vessel.id}>{vessel.name}</option>)}</select><span aria-hidden="true" className={styles.selectArrow}>⌄</span></div>
          <div className={styles.battleActions}><button className={`${screen.primaryAction} ${styles.fightAction}`} disabled={!selectedVessel || isFighting} onClick={startBattle} type="button">{phase === "result" ? "もう一度戦う" : "戦う"}</button><button className={`${screen.secondaryAction} ${styles.backAction}`} onClick={onBack} type="button">戻る</button></div>
        </section>
      </div>
    </main>
  );
}
