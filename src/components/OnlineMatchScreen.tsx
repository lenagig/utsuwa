"use client";

import { useEffect, useState } from "react";
import screen from "@/components/Screen.module.css";
import styles from "@/components/OnlineMatchScreen.module.css";
import type { Vessel } from "@/types/vessel";

type Room = { id: string; room_code: string; status: "waiting" | "matched"; host_vessel_id: string; guest_vessel_id: string | null };

export function OnlineMatchScreen({ accessToken, onBack, vessel }: { accessToken: string; onBack: () => void; vessel: Vessel | null }) {
  const [roomCode, setRoomCode] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState("ランダム対戦、または部屋番号で友だちと対戦できます。");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!room || room.status !== "waiting") return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/battle/rooms/${room.id}`, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!response.ok) return;
      const data = await response.json() as { room: Room };
      setRoom(data.room);
      if (data.room.status === "matched") setMessage("マッチ成立！ 対戦相手の接続を確認しています。");
    }, 1500);
    return () => window.clearInterval(timer);
  }, [accessToken, room]);

  async function request(path: string, body: Record<string, string>) {
    if (!vessel) return;
    setBusy(true);
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ ...body, vesselId: vessel.id }) });
      const data = await response.json() as { error?: string; room?: Room; state?: string };
      if (!response.ok || !data.room) throw new Error(data.error ?? "マッチングに失敗しました。");
      setRoom(data.room);
      setMessage(data.state === "matched" ? "マッチ成立！ 対戦相手の接続を確認しています。" : "対戦相手を待っています。部屋番号を共有してください。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "マッチングに失敗しました。");
    } finally { setBusy(false); }
  }

  return <main className={`${screen.titlePage} ${styles.page}`}>
    <section className={styles.panel}>
      <span>ONLINE MATCH</span><h1>オンライン対戦</h1>
      <p className={styles.selected}>使用する器：{vessel?.name ?? "器を選んでください"}</p>
      {!room && <>
        <button className={screen.primaryAction} disabled={!vessel || busy} onClick={() => request("/api/battle/rooms/random", {})}>{busy ? "接続中…" : "ランダムマッチ"}</button>
        <div className={styles.divider}>または</div>
        <label>部屋番号で対戦<input maxLength={6} onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="例：KIRA26" value={roomCode}/></label>
        <button className={screen.secondaryAction} disabled={!vessel || busy || roomCode.length !== 6} onClick={() => request("/api/battle/rooms/join", { roomCode })}>部屋に入る</button>
      </>}
      {room && <section className={styles.room}><small>{room.status === "waiting" ? "WAITING ROOM" : "MATCHED"}</small><b>{room.room_code}</b><p>{message}</p>{room.status === "matched" && <p className={styles.note}>ルーム作成・参加は完了しました。対戦中の移動・投擲・HPは、この部屋を使ってRealtime同期します。</p>}</section>}
      <p className={styles.message}>{!room ? message : ""}</p>
      <button className={styles.back} onClick={onBack}>対戦準備へ戻る</button>
    </section>
  </main>;
}
