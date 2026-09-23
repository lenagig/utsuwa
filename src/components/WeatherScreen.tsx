import screen from "@/components/Screen.module.css";
import styles from "@/components/WeatherScreen.module.css";

type DailyGeneration = {
  count: number;
  date: string;
};

type WeatherScreenProps = {
  dailyGeneration: DailyGeneration;
  onBack: () => void;
};

export function WeatherScreen({
  dailyGeneration,
  onBack
}: WeatherScreenProps) {
  return (
    <main className={`${screen.titlePage} ${styles.weatherPage}`}>
      <section
        className={`${screen.titlePanel} ${styles.weatherPanel}`}
        aria-labelledby="weather-title"
      >
        <h1 className={styles.weatherTitle} id="weather-title">
          天気予報
        </h1>
        <p className={styles.weatherLead}>今日、全国で生まれた器</p>

        <dl className={styles.weatherStats}>
          <div>
            <dt>本日できた器</dt>
            <dd>{dailyGeneration.count} 個</dd>
          </div>
          <div>
            <dt>観測日</dt>
            <dd>{dailyGeneration.date}</dd>
          </div>
        </dl>

        <p className={styles.weatherText}>
          日付が変わると、この数字は自動的にゼロから数え直します。
        </p>

        <button className={screen.secondaryAction} onClick={onBack} type="button">
          戻る
        </button>
      </section>
    </main>
  );
}
