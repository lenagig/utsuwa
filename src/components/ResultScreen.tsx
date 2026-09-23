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

export function ResultScreen({
  irritationText,
  onBattle,
  vessel,
  onBack,
  showOwner = true
}: ResultScreenProps) {
  const ownerText = irritationText || "〜〜";

  return (
    <main className={`${screen.titlePage} ${styles.resultPage}`}>
      <section
        className={`${screen.titlePanel} ${styles.resultPanel}`}
        aria-labelledby="result-title"
      >
        {showOwner ? <p className={styles.resultOwner}>{ownerText}の器は</p> : null}
        <div className={styles.vesselResultImage}>
          {vessel.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={vessel.name} src={vessel.imageUrl} />
          ) : (
            <span>画像</span>
          )}
        </div>

        <h1 className={styles.resultTitle} id="result-title">
          {vessel.name}
        </h1>

        <p className={styles.resultFeature}>{vessel.feature}</p>

        <div className={styles.resultActions}>
          <button className={screen.primaryAction} onClick={onBattle} type="button">
            器でバトルする
          </button>
          <button className={screen.secondaryAction} onClick={onBack} type="button">
            戻る
          </button>
        </div>
      </section>
    </main>
  );
}
