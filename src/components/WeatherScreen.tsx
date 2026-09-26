import screen from "@/components/Screen.module.css";
import styles from "@/components/WeatherScreen.module.css";
import type { IrritationForecast } from "@/lib/irritation-weather";

type WeatherScreenProps = {
  nationalTodayCount: number;
  forecast: IrritationForecast | null;
  onBack: () => void;
};

export function WeatherScreen({ nationalTodayCount, forecast, onBack }: WeatherScreenProps) {
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
          <section className={styles.forecast} aria-label="地域別いらいら予報">
            <p>{forecast?.regionalMessage ?? "地域別の予報を読み込んでいます。"}</p>
            <p>{forecast?.prefectureMessage ?? "住んでいる場所を登録すると地域別に集計されます。"}</p>
          </section>
          <p className={styles.weatherText}>日付が変わると、この数字は全国分として新しい一日へ切り替わります。</p>
          <button className={screen.secondaryAction} onClick={onBack} type="button">戻る</button>
        </section>
      </div>
    </main>
  );
}
