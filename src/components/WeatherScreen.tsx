import screen from "@/components/Screen.module.css";
import styles from "@/components/WeatherScreen.module.css";

type WeatherScreenProps = {
  nationalTodayCount: number;
  onBack: () => void;
};

export function WeatherScreen({ nationalTodayCount, onBack }: WeatherScreenProps) {
  const today = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <main className={`${screen.titlePage} ${styles.weatherPage}`}>
      <div className={screen.screenContent}>
        <section className={`${screen.titlePanel} ${styles.weatherPanel}`} aria-labelledby="weather-title">
          <h1 className={styles.weatherTitle} id="weather-title">天気予報</h1>
          <p className={styles.weatherLead}>本日、全国で生まれた器</p>
          <dl className={styles.weatherStats}>
            <div><dt>本日できた器</dt><dd>{nationalTodayCount.toLocaleString("ja-JP")} 個</dd></div>
            <div><dt>集計日</dt><dd>{today}</dd></div>
          </dl>
          <p className={styles.weatherText}>日付が変わると、この数字は全国分として新しい一日へ切り替わります。</p>
          <button className={screen.secondaryAction} onClick={onBack} type="button">戻る</button>
        </section>
      </div>
    </main>
  );
}
