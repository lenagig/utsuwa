import type { Vessel } from "@/types/vessel";

type BattleScreenProps = {
  onBack: () => void;
  selectedVessel: Vessel | null;
};

export function BattleScreen({ onBack, selectedVessel }: BattleScreenProps) {
  return (
    <main className="titlePage utilityPage">
      <section className="titlePanel utilityPanel" aria-labelledby="battle-title">
        <h1 className="utilityTitle" id="battle-title">
          バトル
        </h1>
        <p className="utilityLead">
          {selectedVessel
            ? `選択中：${selectedVessel.name}`
            : "まずは器を選んでください。"}
        </p>

        <div className="battleArena">
          <span>準備中</span>
        </div>

        <p className="utilityText">
          対戦演出は準備中です。選ばれた器はここで使われます。
        </p>

        <button className="secondaryAction" onClick={onBack} type="button">
          戻る
        </button>
      </section>
    </main>
  );
}
