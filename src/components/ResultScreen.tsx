import type { Vessel } from "@/types/vessel";

type ResultScreenProps = {
  irritationText: string;
  onBattle: () => void;
  vessel: Vessel;
  onBack: () => void;
  showOwner?: boolean;
};

export function ResultScreen({
  irritationText,
  onBattle,
  vessel,
  onBack,
  showOwner = true
}: ResultScreenProps) {
  const ownerText = irritationText || "〜〜";

  return (
    <main className="titlePage resultPage">
      <section className="titlePanel resultPanel" aria-labelledby="result-title">
        {showOwner ? <p className="resultOwner">{ownerText}の器は</p> : null}
        <div className="vesselResultImage">
          {vessel.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={vessel.name} src={vessel.imageUrl} />
          ) : (
            <span>画像</span>
          )}
        </div>

        <h1 className="resultTitle" id="result-title">
          {vessel.name}
        </h1>

        <p className="resultFeature">{vessel.feature}</p>

        <div className="resultActions">
          <button className="primaryAction" onClick={onBattle} type="button">
            器でバトルする
          </button>
          <button className="secondaryAction" onClick={onBack} type="button">
            戻る
          </button>
        </div>
      </section>
    </main>
  );
}
