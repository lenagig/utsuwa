"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BattleArena3D, type FlyingVessel } from "@/components/BattleArena3D";
import type { Vessel } from "@/types/vessel";
import screen from "@/components/Screen.module.css";
import styles from "@/components/BattleScreen.module.css";

type Props = {
  onBack: () => void;
  onSelectVessel: (id: string) => void;
  vessels: Vessel[];
  selectedVessel: Vessel | null;
};

const clamp = (n: number) => Math.max(-2.6, Math.min(2.6, n));
const damage = (vessel: Vessel) => Math.round(12 + vessel.attack / 11);

export function BattleScreen({
  onBack,
  onSelectVessel,
  vessels,
  selectedVessel,
}: Props) {
  const [mode, setMode] = useState<"ready" | "playing" | "ended">("ready");
  const [playerHp, setPlayerHp] = useState(100);
  const [rivalHp, setRivalHp] = useState(100);
  const [playerZ, setPlayerZ] = useState(0);
  const [aiZ, setAiZ] = useState(0);
  const [shots, setShots] = useState<FlyingVessel[]>([]);
  const [rival, setRival] = useState<Vessel | null>(null);
  const [hit, setHit] = useState<"player" | "rival" | null>(null);
  const [winner, setWinner] = useState<"player" | "rival" | null>(null);
  const [shake, setShake] = useState(0);

  const keys = useRef(new Set<string>());
  const touchDirection = useRef(0);
  const pz = useRef(0);
  const az = useRef(0);
  const fireAt = useRef(0);
  const aiAt = useRef(0);
  const nextId = useRef(1);
  const modeRef = useRef(mode);
  const rivalRef = useRef<Vessel | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    rivalRef.current = rival;
  }, [rival]);

  function finish(side: "player" | "rival") {
    setWinner(side);
    setMode("ended");
  }

  const fire = useCallback(() => {
    if (modeRef.current !== "playing" || !selectedVessel) return;

    const now = Date.now();
    if (now - fireAt.current < 650) return;

    fireAt.current = now;
    setShots((old) =>
      old.filter((shot) => shot.owner === "player").length >= 3
        ? old
        : [
            ...old,
            {
              id: nextId.current++,
              owner: "player",
              progress: 0,
              vessel: selectedVessel,
              z: pz.current,
            },
          ],
    );
  }, [selectedVessel]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " "].includes(e.key)) {
        e.preventDefault();
      }
      keys.current.add(e.key);
      if (e.key === " ") fire();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [selectedVessel, mode, fire]);

  useEffect(() => {
    const loop = window.setInterval(() => {
      if (modeRef.current !== "playing") return;

      const left =
        keys.current.has("ArrowLeft") ||
        keys.current.has("a") ||
        keys.current.has("A") ||
        touchDirection.current === 1;
      const right =
        keys.current.has("ArrowRight") ||
        keys.current.has("d") ||
        keys.current.has("D") ||
        touchDirection.current === -1;

      if (left || right) {
        pz.current = clamp(pz.current + (right ? 0.09 : -0.09));
        setPlayerZ(pz.current);
      }

      az.current = clamp(az.current + (Math.random() - 0.5) * 0.18);
      setAiZ(az.current);

      const now = Date.now();
      if (now - aiAt.current > 900 + Math.random() * 500) {
        aiAt.current = now;
        const vessel = rivalRef.current;
        if (vessel) {
          setShots((old) =>
            old.filter((shot) => shot.owner === "rival").length >= 3
              ? old
              : [
                  ...old,
                  {
                    id: nextId.current++,
                    owner: "rival",
                    progress: 0,
                    vessel,
                    z: az.current,
                  },
                ],
          );
        }
      }
    }, 45);

    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    const loop = window.setInterval(() => {
      if (modeRef.current !== "playing") return;

      setShots((old) => {
        const next: FlyingVessel[] = [];

        for (const shot of old) {
          const moved = { ...shot, progress: shot.progress + 0.035 };
          if (moved.progress < 1) {
            next.push(moved);
            continue;
          }

          const target = shot.owner === "player" ? az.current : pz.current;
          if (Math.abs(moved.z - target) < 0.72) {
            const targetSide = shot.owner === "player" ? "rival" : "player";
            setHit(targetSide);
            setShake(1);
            window.setTimeout(() => {
              setHit(null);
              setShake(0);
            }, 350);

            if (targetSide === "rival") {
              setRivalHp((h) => {
                const n = Math.max(0, h - damage(shot.vessel));
                if (n === 0) finish("player");
                return n;
              });
            } else {
              setPlayerHp((h) => {
                const n = Math.max(0, h - damage(shot.vessel));
                if (n === 0) finish("rival");
                return n;
              });
            }
          }
        }

        return next;
      });
    }, 50);

    return () => clearInterval(loop);
  }, []);

  function start() {
    if (!selectedVessel) return;

    const candidates = vessels.filter((vessel) => vessel.id !== selectedVessel.id);
    setRival(candidates[Math.floor(Math.random() * candidates.length)] ?? selectedVessel);
    setPlayerHp(100);
    setRivalHp(100);
    setShots([]);
    setWinner(null);
    pz.current = 0;
    az.current = 0;
    setPlayerZ(0);
    setAiZ(0);
    setMode("playing");
  }

  function handleBack() {
    if (mode !== "ended") {
      onBack();
      return;
    }

    setPlayerHp(100);
    setRivalHp(100);
    setRival(null);
    setShots([]);
    setHit(null);
    setShake(0);
    setWinner(null);
    pz.current = 0;
    az.current = 0;
    fireAt.current = 0;
    aiAt.current = 0;
    touchDirection.current = 0;
    keys.current.clear();
    setPlayerZ(0);
    setAiZ(0);
    setMode("ready");
  }

  const text =
    mode === "ended"
      ? winner === "player"
        ? "勝利"
        : "敗北"
      : mode === "playing"
        ? "左右移動で回避　SPACEで投げる"
        : "器を選んで開始";

  return (
    <main
      className={`${screen.titlePage} ${styles.battlePage} ${hit ? styles.hitFlash : ""}`}
    >
      <div className={styles.arena}>
        <BattleArena3D
          aiZ={aiZ}
          hit={hit}
          player={selectedVessel}
          playerZ={playerZ}
          projectiles={shots}
          rival={rival}
          shake={shake}
          winner={winner}
        />
      </div>

      <div className={screen.screenContent}>
        <div className={styles.hud}>
          <header>
            <h1>器 闘 技 場</h1>
          </header>

          <section className={styles.health}>
            <div className={styles.fighter}>
              <b>RED / YOU</b>
              <strong>{selectedVessel?.name ?? "器を選択"}</strong>
              <div>
                <i style={{ width: `${playerHp}%` }} />
              </div>
              <small>
                HP {playerHp}　ATK {selectedVessel?.attack ?? "--"}
              </small>
            </div>
            <em>VS</em>
            <div className={styles.fighter}>
              <b>BLUE / AI</b>
              <strong>{rival?.name ?? "対戦相手"}</strong>
              <div>
                <i style={{ width: `${rivalHp}%` }} />
              </div>
              <small>
                HP {rivalHp}　ATK {rival?.attack ?? "--"}
              </small>
            </div>
          </section>

          <section
            className={`${styles.controls} ${mode !== "playing" ? styles.centerControls : ""}`}
          >
            <p className={mode === "ended" ? styles.result : ""}>{text}</p>

            {mode === "ready" && (
              <div className={styles.selectWrap}>
                <select
                  value={selectedVessel?.id ?? ""}
                  onChange={(e) => onSelectVessel(e.target.value)}
                >
                  {vessels.map((vessel) => (
                    <option key={vessel.id} value={vessel.id}>
                      {vessel.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {mode === "playing" ? (
              <div className={styles.touchControls}>
                <button
                  aria-label="左へ移動"
                  className={styles.moveButton}
                  onPointerCancel={() => (touchDirection.current = 0)}
                  onPointerDown={() => (touchDirection.current = 1)}
                  onPointerLeave={() => (touchDirection.current = 0)}
                  onPointerUp={() => (touchDirection.current = 0)}
                >
                  ‹
                </button>
                <button className={styles.throwButton} onClick={fire}>
                  投げる
                </button>
                <button
                  aria-label="右へ移動"
                  className={styles.moveButton}
                  onPointerCancel={() => (touchDirection.current = 0)}
                  onPointerDown={() => (touchDirection.current = -1)}
                  onPointerLeave={() => (touchDirection.current = 0)}
                  onPointerUp={() => (touchDirection.current = 0)}
                >
                  ›
                </button>
              </div>
            ) : (
              <div className={styles.actions}>
                <button
                  className={screen.primaryAction}
                  disabled={!selectedVessel}
                  onClick={start}
                >
                  {mode === "ended" ? "再戦する" : "戦闘開始"}
                </button>
                <button className={screen.secondaryAction} onClick={handleBack}>
                  戻る
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
