"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { BattleArena3D, type FlyingVessel } from "@/components/BattleArena3D";
import screen from "@/components/Screen.module.css";
import styles from "@/components/BattleScreen.module.css";
import { vessels as allVessels } from "@/data/vessels";
import type { Vessel, VesselAbility } from "@/types/vessel";

type Side = "player" | "rival";
type Mode = "ready" | "playing" | "ended";
type MoveDirection = -1 | 1;
type TimedEffect = "poison" | "burn" | "attackSlow" | "moveSlow" | "reverse" | "defense" | "speed" | "invincible";
type Effects = Record<Side, Partial<Record<TimedEffect, number>>>;

type Props = {
  onBack: () => void;
  onSelectVessel: (id: string) => void;
  vessels: Vessel[];
  selectedVessel: Vessel | null;
};

const MAX_SHOTS = 3;
const clamp = (value: number) => Math.max(-2.6, Math.min(2.6, value));
const debuffs = new Set<VesselAbility>(["poison", "burn", "attackSlow", "moveSlow", "reverse"]);
const effectLabel: Record<TimedEffect, string> = {
  poison: "毒",
  burn: "火傷",
  attackSlow: "投擲低下",
  moveSlow: "移動低下",
  reverse: "左右反転",
  defense: "防御上昇",
  speed: "加速",
  invincible: "復活無敵",
};

export function BattleScreen({ onBack, onSelectVessel, vessels, selectedVessel }: Props) {
  const [mode, setMode] = useState<Mode>("ready");
  const [challenge, setChallenge] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [rivalHp, setRivalHp] = useState(100);
  const [stocks, setStocks] = useState(1);
  const [shield, setShield] = useState(0);
  const [enraged, setEnraged] = useState(false);
  const [enrageCutin, setEnrageCutin] = useState(false);
  const [playerZ, setPlayerZ] = useState(0);
  const [aiZ, setAiZ] = useState(0);
  const [shots, setShots] = useState<FlyingVessel[]>([]);
  const [rival, setRival] = useState<Vessel | null>(null);
  const [hit, setHit] = useState<Side | null>(null);
  const [winner, setWinner] = useState<Side | null>(null);
  const [shake, setShake] = useState(0);
  const [notice, setNotice] = useState("器の能力を使って勝利をつかめ。");
  const [effectSnapshot, setEffectSnapshot] = useState<Effects>({ player: {}, rival: {} });

  const keys = useRef(new Set<string>());
  const touchDirections = useRef(new Map<number, MoveDirection>());
  const playerZRef = useRef(0);
  const aiZRef = useRef(0);
  const fireAt = useRef(0);
  const aiAt = useRef(0);
  const nextId = useRef(1);
  const modeRef = useRef<Mode>(mode);
  const rivalRef = useRef<Vessel | null>(null);
  const challengeRef = useRef(false);
  const stocksRef = useRef(1);
  const shieldRef = useRef(0);
  const enragedRef = useRef(false);
  const playerHpRef = useRef(100);
  const rivalHpRef = useRef(100);
  const revivingRef = useRef(false);
  const invincibleUntil = useRef(0);
  const resolvedShots = useRef(new Set<number>());
  const effects = useRef<Effects>({ player: {}, rival: {} });
  const dotAt = useRef({ player: 0, rival: 0 });

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { rivalRef.current = rival; }, [rival]);
  useEffect(() => { challengeRef.current = challenge; }, [challenge]);
  useEffect(() => {
    const timer = window.setInterval(() => setEffectSnapshot({ player: { ...effects.current.player }, rival: { ...effects.current.rival } }), 250);
    return () => window.clearInterval(timer);
  }, []);

  const vesselFor = useCallback((side: Side) => side === "player" ? selectedVessel : rivalRef.current, [selectedVessel]);
  const hasEffect = useCallback((side: Side, effect: TimedEffect) => (effects.current[side][effect] ?? 0) > Date.now(), []);
  const setTimedEffect = useCallback((side: Side, effect: TimedEffect, duration: number) => {
    effects.current[side][effect] = Date.now() + duration;
    setEffectSnapshot({ player: { ...effects.current.player }, rival: { ...effects.current.rival } });
  }, []);
  const isImmune = useCallback((side: Side) => {
    const vessel = vesselFor(side);
    return challengeRef.current && side === "rival" || vessel?.ability === "debuffImmune";
  }, [vesselFor]);

  const finish = useCallback((side: Side) => {
    touchDirections.current.clear();
    modeRef.current = "ended";
    setWinner(side);
    setMode("ended");
  }, []);

  const dealDamage = useCallback((target: Side, rawDamage: number, source: Side) => {
    if (modeRef.current !== "playing") return;
    if (target === "player" && (revivingRef.current || invincibleUntil.current > Date.now())) {
      setNotice("復活直後の無敵時間！");
      return;
    }
    if (target === "rival" && challengeRef.current && shieldRef.current > 0) {
      shieldRef.current -= 1;
      setShield(shieldRef.current);
      setNotice(`BOSS SHIELD が攻撃を無効化！ 残り ${shieldRef.current}`);
      return;
    }

    const damageRate = hasEffect(target, "defense") ? 0.8 : target === "rival" && enragedRef.current ? 0.65 : 1;
    const reduced = Math.max(1, Math.round(rawDamage * damageRate));
    const hpRef = target === "player" ? playerHpRef : rivalHpRef;
    const next = Math.max(0, hpRef.current - reduced);
    hpRef.current = next;
    (target === "player" ? setPlayerHp : setRivalHp)(next);

    if (target === "rival" && challengeRef.current && next <= 100 && !enragedRef.current) {
      enragedRef.current = true;
      setEnraged(true);
      setEnrageCutin(true);
      setNotice("BOSS が激昂！ 攻撃力・防御力が上昇した。");
      window.setTimeout(() => setEnrageCutin(false), 1300);
    }
    if (next > 0) return;
    if (target === "player" && challengeRef.current && stocksRef.current > 1) {
      stocksRef.current -= 1;
      setStocks(stocksRef.current);
      playerHpRef.current = 1;
      setPlayerHp(1);
      revivingRef.current = true;
      setNotice(`ストック残り ${stocksRef.current}。自動復活まで…`);
      window.setTimeout(() => {
        if (modeRef.current !== "playing") return;
        playerHpRef.current = 100;
        setPlayerHp(100);
        revivingRef.current = false;
        invincibleUntil.current = Date.now() + 2000;
        setTimedEffect("player", "invincible", 2000);
        setNotice("復活！ 2秒間無敵。");
      }, 650);
      return;
    }
    finish(source);
  }, [finish, hasEffect, setTimedEffect]);

  const scheduleLightning = useCallback((target: Side) => {
    const targetZ = target === "player" ? playerZRef.current : aiZRef.current;
    setNotice("⚡ 雷雲が狙いを定めている…");
    window.setTimeout(() => {
      if (modeRef.current !== "playing") return;
      const currentZ = target === "player" ? playerZRef.current : aiZRef.current;
      if (Math.abs(targetZ - currentZ) < 0.72) {
        setNotice("⚡ 落雷！ 8 ダメージ");
        dealDamage(target, 8, target === "player" ? "rival" : "player");
        setShake(1);
        window.setTimeout(() => setShake(0), 240);
      } else {
        setNotice("⚡ 落雷を回避した！");
      }
    }, 1000);
  }, [dealDamage]);

  const applyAbility = useCallback((source: Side, vessel: Vessel, hitDamage: number) => {
    const target: Side = source === "player" ? "rival" : "player";
    const abilityList: VesselAbility[] = challengeRef.current && source === "rival"
      ? ["poison", "burn", "attackSlow", "thunder", "lifeSteal", "reverse", "moveSlow", "defense", "invisible", "spectacle"]
      : [vessel.ability];

    abilityList.forEach((ability) => {
      if (debuffs.has(ability) && isImmune(target)) return;
      if (ability === "poison") setTimedEffect(target, "poison", 3000);
      if (ability === "burn") setTimedEffect(target, "burn", 3000);
      if (ability === "attackSlow") setTimedEffect(target, "attackSlow", 3000);
      if (ability === "moveSlow") setTimedEffect(target, "moveSlow", 2500);
      if (ability === "reverse") setTimedEffect(target, "reverse", 2500);
      if (ability === "thunder") scheduleLightning(target);
      if (ability === "lifeSteal") {
        const heal = Math.max(1, Math.round(hitDamage * 0.25));
        const maxHp = source === "rival" && challengeRef.current ? 300 : 100;
        const hpRef = source === "player" ? playerHpRef : rivalHpRef;
        hpRef.current = Math.min(maxHp, hpRef.current + heal);
        (source === "player" ? setPlayerHp : setRivalHp)(hpRef.current);
      }
      if (ability === "defense") setTimedEffect(source, "defense", 3000);
      if (ability === "spectacle") setNotice("守護神と猫がフィールドを横切った。効果はない。🐈");
    });
    if (vessel.ability === "debuffImmune") setNotice("状態異常を受け付けない器だ。");
    if (vessel.ability === "invisible") setNotice("見えにくい器が飛んでいく…");
  }, [isImmune, scheduleLightning, setTimedEffect]);

  const resolveHit = useCallback((shot: FlyingVessel) => {
    if (resolvedShots.current.has(shot.id)) return;
    resolvedShots.current.add(shot.id);
    const source = shot.owner;
    const target: Side = source === "player" ? "rival" : "player";
    const hitDamage = Math.round(shot.vessel.attack * (shot.owner === "rival" && challengeRef.current && enragedRef.current ? 1.45 : 1));
    setHit(target);
    setShake(1);
    window.setTimeout(() => { setHit(null); setShake(0); }, 350);
    dealDamage(target, hitDamage, source);
    applyAbility(source, shot.vessel, hitDamage);
  }, [applyAbility, dealDamage]);

  const launch = useCallback((owner: Side, vessel: Vessel, z: number) => {
    const count = vessel.ability === "doubleThrow" || (challengeRef.current && owner === "rival") ? 2 : 1;
    setShots((old) => {
      const available = Math.max(0, MAX_SHOTS - old.filter((shot) => shot.owner === owner).length);
      if (!available) return old;
      const next = Array.from({ length: Math.min(count, available) }, (_, index) => ({
        id: nextId.current++,
        owner,
        progress: 0,
        vessel,
        z: clamp(z + (count === 2 ? (index ? 0.28 : -0.28) : 0)),
        hidden: vessel.ability === "invisible" || (challengeRef.current && owner === "rival"),
      }));
      return [...old, ...next];
    });
  }, []);

  const fire = useCallback(() => {
    if (modeRef.current !== "playing" || !selectedVessel) return;
    const cooldown = Math.round(760 * (hasEffect("player", "attackSlow") ? 1.3 : 1) * (selectedVessel.ability === "invisible" ? 1.35 : 1));
    if (Date.now() - fireAt.current < cooldown) return;
    fireAt.current = Date.now();
    launch("player", selectedVessel, playerZRef.current);
  }, [hasEffect, launch, selectedVessel]);

  const beginTouchMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
    direction: MoveDirection,
  ) => {
    event.preventDefault();
    touchDirections.current.set(event.pointerId, direction);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const endTouchMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    touchDirections.current.delete(event.pointerId);
  };

  const throwOnPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fire();
  };

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "a", "d", "A", "D", " "].includes(event.key)) event.preventDefault();
      keys.current.add(event.key);
      if (event.key === " ") fire();
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [fire]);

  useEffect(() => {
    const loop = window.setInterval(() => {
      if (modeRef.current !== "playing") return;
      let touchLeft = false;
      let touchRight = false;
      for (const direction of touchDirections.current.values()) {
        if (direction === 1) touchLeft = true;
        if (direction === -1) touchRight = true;
      }
      const left = keys.current.has("ArrowLeft") || keys.current.has("a") || keys.current.has("A") || touchLeft;
      const right = keys.current.has("ArrowRight") || keys.current.has("d") || keys.current.has("D") || touchRight;
      const reversed = hasEffect("player", "reverse");
      const speed = hasEffect("player", "moveSlow") ? 0.05 : 0.09;
      if (left || right) {
        const direction = right ? 1 : -1;
        playerZRef.current = clamp(playerZRef.current + direction * speed * (reversed ? -1 : 1));
        setPlayerZ(playerZRef.current);
      }
      const aiSpeed = challengeRef.current ? 0.25 : 0.18;
      aiZRef.current = clamp(aiZRef.current + (Math.random() - 0.5) * aiSpeed);
      setAiZ(aiZRef.current);
      const rivalVessel = rivalRef.current;
      const aiCooldown = challengeRef.current ? 760 + Math.random() * 280 : 900 + Math.random() * 500;
      if (rivalVessel && Date.now() - aiAt.current > aiCooldown) {
        aiAt.current = Date.now();
        launch("rival", rivalVessel, aiZRef.current);
      }
    }, 45);
    return () => window.clearInterval(loop);
  }, [hasEffect, launch]);

  useEffect(() => {
    const loop = window.setInterval(() => {
      if (modeRef.current !== "playing") return;
      setShots((old) => {
        const next: FlyingVessel[] = [];
        old.forEach((shot) => {
          const moved = { ...shot, progress: shot.progress + 0.035 };
          if (moved.progress < 1) { next.push(moved); return; }
          const targetZ = shot.owner === "player" ? aiZRef.current : playerZRef.current;
          if (Math.abs(moved.z - targetZ) < 0.72) resolveHit(shot);
        });
        return next;
      });
      (["player", "rival"] as Side[]).forEach((side) => {
        if (!hasEffect(side, "poison") && !hasEffect(side, "burn")) return;
        if (Date.now() - dotAt.current[side] < 1000) return;
        dotAt.current[side] = Date.now();
        const source: Side = side === "player" ? "rival" : "player";
        dealDamage(side, 2, source);
      });
    }, 50);
    return () => window.clearInterval(loop);
  }, [dealDamage, hasEffect, resolveHit]);

  const start = () => {
    if (!selectedVessel) return;
    touchDirections.current.clear();
    const candidates = allVessels.filter((vessel) => vessel.id !== selectedVessel.id);
    const opponent = candidates[Math.floor(Math.random() * candidates.length)] ?? allVessels[0];
    setRival(opponent);
    playerHpRef.current = 100;
    rivalHpRef.current = challenge ? 300 : 100;
    setPlayerHp(100);
    setRivalHp(rivalHpRef.current);
    stocksRef.current = challenge ? 3 : 1;
    setStocks(stocksRef.current);
    shieldRef.current = challenge ? 5 : 0;
    setShield(shieldRef.current);
    enragedRef.current = false;
    setEnraged(false);
    setEnrageCutin(false);
    revivingRef.current = false;
    invincibleUntil.current = 0;
    resolvedShots.current.clear();
    effects.current = { player: {}, rival: {} };
    setEffectSnapshot({ player: {}, rival: {} });
    setShots([]);
    setWinner(null);
    playerZRef.current = 0;
    aiZRef.current = 0;
    setPlayerZ(0);
    setAiZ(0);
    challengeRef.current = challenge;
    setNotice(challenge ? "チャレンジ開始。HP300・シールド5枚・全能力。" : "通常戦。直撃4〜5回で決着する。" );
    modeRef.current = "playing";
    setMode("playing");
  };

  function handleBack() {
    if (mode !== "ended") {
      onBack();
      return;
    }

    modeRef.current = "ready";
    playerHpRef.current = 100;
    rivalHpRef.current = challenge ? 300 : 100;
    setPlayerHp(100);
    setRivalHp(rivalHpRef.current);
    stocksRef.current = 1;
    shieldRef.current = 0;
    enragedRef.current = false;
    setStocks(1);
    setShield(0);
    setEnraged(false);
    setEnrageCutin(false);
    revivingRef.current = false;
    invincibleUntil.current = 0;
    resolvedShots.current.clear();
    effects.current = { player: {}, rival: {} };
    dotAt.current = { player: 0, rival: 0 };
    setEffectSnapshot({ player: {}, rival: {} });
    rivalRef.current = null;
    setRival(null);
    setShots([]);
    setHit(null);
    setShake(0);
    setWinner(null);
    playerZRef.current = 0;
    aiZRef.current = 0;
    setPlayerZ(0);
    setAiZ(0);
    fireAt.current = 0;
    aiAt.current = 0;
    touchDirections.current.clear();
    keys.current.clear();
    setNotice("器の能力を使って勝利をつかめ。");
    setMode("ready");
  }

  const activeEffects = (side: Side) => Object.keys(effectSnapshot[side])
    .filter((effect) => (effectSnapshot[side][effect as TimedEffect] ?? 0) > Date.now())
    .map((effect) => effectLabel[effect as TimedEffect]);
  const resultText = winner === "player" ? "勝 利" : "敗 北";

  return <main className={`${screen.titlePage} ${styles.battlePage} ${hit ? styles.hitFlash : ""}`}>
    <div className={styles.arena}><BattleArena3D aiZ={aiZ} hit={hit} player={selectedVessel} playerZ={playerZ} projectiles={shots} rival={rival} shake={shake} winner={winner}/></div>
    {enrageCutin && <div className={styles.enrageCutin}><span>WARNING</span><strong>BOSS ENRAGED</strong><small>攻撃力・防御力 上昇</small></div>}
    <div className={screen.screenContent}>
    <div className={styles.hud}>
      <header><h1>器 闘 技 場</h1></header>
      <section className={styles.health}>
        <FighterHud alignment="left" effects={activeEffects("player")} hp={playerHp} label="RED / YOU" vessel={selectedVessel} stocks={stocks}/>
        <em>VS</em>
        <FighterHud alignment="right" effects={activeEffects("rival")} hp={rivalHp} label={challenge ? "BLUE / CHALLENGE" : "BLUE / AI"} maxHp={challenge ? 300 : 100} vessel={rival} stocks={challenge ? 1 : undefined} shield={shield} enraged={enraged}/>
      </section>
      <section className={`${styles.controls} ${mode !== "playing" ? styles.centerControls : ""}`}>
        <p className={mode === "ended" ? styles.result : ""}>{mode === "ended" ? resultText : notice}</p>
        {mode === "playing" && <small className={styles.keyboardHelp}>左右キーで移動　スペースキーで器を投げる</small>}
        {mode === "ready" && <>
          <div className={styles.selectWrap}><select value={selectedVessel?.id ?? ""} onChange={(event) => onSelectVessel(event.target.value)}>{vessels.map((vessel) => <option key={vessel.id} value={vessel.id}>{vessel.name} / {vessel.abilityLabel}</option>)}</select></div>
          {selectedVessel && <div className={styles.abilityCard}><b>{selectedVessel.abilityLabel}</b><span>{selectedVessel.abilityDescription}</span></div>}
          <label className={styles.challengeToggle}><input checked={challenge} onChange={(event) => {
            const enabled = event.target.checked;
            const nextRivalHp = enabled ? 300 : 100;
            setChallenge(enabled);
            rivalHpRef.current = nextRivalHp;
            setRivalHp(nextRivalHp);
          }} type="checkbox"/>チャレンジ：敵は全能力・HP300・シールド5枚／あなたは3ストック</label>
        </>}
        {mode === "playing" ? <div className={styles.touchControls}>
          <button aria-label="左へ移動" className={styles.moveButton} onLostPointerCapture={endTouchMove} onPointerCancel={endTouchMove} onPointerDown={(event) => beginTouchMove(event, 1)} onPointerUp={endTouchMove}>‹</button>
          <button className={styles.throwButton} onPointerDown={throwOnPointerDown}>投げる</button>
          <button aria-label="右へ移動" className={styles.moveButton} onLostPointerCapture={endTouchMove} onPointerCancel={endTouchMove} onPointerDown={(event) => beginTouchMove(event, -1)} onPointerUp={endTouchMove}>›</button>
        </div> : <div className={styles.actions}><button className={screen.primaryAction} disabled={!selectedVessel} onClick={start}>{mode === "ended" ? "再戦する" : "戦闘開始"}</button><button className={screen.secondaryAction} onClick={handleBack}>戻る</button></div>}
      </section>
    </div>
    </div>
  </main>;
}

function FighterHud({ alignment, effects, enraged, hp, label, maxHp = 100, shield, stocks, vessel }: { alignment: "left" | "right"; effects: string[]; enraged?: boolean; hp: number; label: string; maxHp?: number; shield?: number; stocks?: number; vessel: Vessel | null }) {
  return <div className={`${styles.fighter} ${alignment === "right" ? styles.right : ""}`}>
    <b>{label}</b><strong>{vessel?.name ?? "対戦相手を選出中"}</strong>
    <div><i style={{ width: `${Math.max(0, Math.min(100, (hp / maxHp) * 100))}%` }}/></div>
    <small>HP {hp}　ATK {vessel?.attack ?? "--"}{stocks && stocks > 1 ? `　STOCK ${stocks}` : ""}</small>
    {typeof shield === "number" && shield > 0 && <span className={styles.shield}>SHIELD × {shield}</span>}
    {enraged && <span className={styles.enraged}>ENRAGED</span>}
    {vessel && <span className={styles.abilityName}>{vessel.abilityLabel}</span>}
    {effects.length > 0 && <span className={styles.statuses}>{effects.join(" / ")}</span>}
  </div>;
}
