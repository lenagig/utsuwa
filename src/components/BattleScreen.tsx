import { useState } from "react";
import type { Vessel } from "@/types/vessel";
import screen from "@/components/Screen.module.css";
import styles from "@/components/BattleScreen.module.css";

type BattleScreenProps = {
  onBack: () => void;
  onSelectVessel: (vesselId: string) => void;
  vessels: Vessel[];
  selectedVessel: Vessel | null;
};

export function BattleScreen({
  onBack,
  onSelectVessel,
  vessels,
  selectedVessel
}: BattleScreenProps) {
  const [battleMessage, setBattleMessage] = useState("");

  return (
    <main className={`${screen.titlePage} ${styles.battlePage}`}>
      <section
        className={`${screen.titlePanel} ${styles.battlePanel}`}
        aria-labelledby="battle-title"
      >
        <h1 className={styles.battleTitle} id="battle-title">
          バトル
        </h1>
        <label className={styles.battleLead} htmlFor="battle-vessel">
          バトルで使う器を選んでください。
        </label>

        <div className={styles.vesselSelectWrap}>
          <select
            className={styles.vesselSelect}
            disabled={vessels.length === 0}
            id="battle-vessel"
            onChange={(event) => {
              onSelectVessel(event.target.value);
              setBattleMessage("");
            }}
            value={selectedVessel?.id ?? ""}
          >
            {vessels.length === 0 ? (
              <option value="">図鑑に登録された器がありません</option>
            ) : (
              vessels.map((vessel) => (
                <option key={vessel.id} value={vessel.id}>
                  {vessel.name}
                </option>
              ))
            )}
          </select>
          <span aria-hidden="true" className={styles.selectArrow}>
            ›
          </span>
        </div>

        {battleMessage ? (
          <p className={styles.battleMessage} role="status">
            {battleMessage}
          </p>
        ) : null}

        <div className={styles.battleActions}>
          <button
            className={`${screen.primaryAction} ${styles.fightAction}`}
            disabled={!selectedVessel}
            onClick={() => setBattleMessage("バトル機能は準備中です。")}
            type="button"
          >
            戦う
          </button>
          <button
            className={`${screen.secondaryAction} ${styles.fightAction}`}
            onClick={onBack}
            type="button"
          >
            戻る
          </button>
        </div>
      </section>
    </main>
  );
}
