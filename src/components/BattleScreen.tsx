import type { Vessel } from "@/types/vessel";
import screen from "@/components/Screen.module.css";
import styles from "@/components/BattleScreen.module.css";

type BattleScreenProps = {
  onBack: () => void;
  selectedVessel: Vessel | null;
};

export function BattleScreen({ onBack, selectedVessel }: BattleScreenProps) {
  return (
    <main className={`${screen.titlePage} ${styles.battlePage}`}>
      <section
        className={`${screen.titlePanel} ${styles.battlePanel}`}
        aria-labelledby="battle-title"
      >
        <h1 className={styles.battleTitle} id="battle-title">
          バトル
        </h1>
        <p className={styles.battleLead}>
          {selectedVessel
            ? `選択中：${selectedVessel.name}`
            : "まずは器を選んでください。"}
        </p>

        <div className={styles.battleArena}>
          <span>準備中</span>
        </div>

        <p className={styles.battleText}>
          対戦演出は準備中です。選ばれた器はここで使われます。
        </p>

        <button className={screen.secondaryAction} onClick={onBack} type="button">
          戻る
        </button>
      </section>
    </main>
  );
}
