export type VesselCreationForWeather = {
  user_id: string;
  created_at: string;
};

export type ProfileLocation = {
  id: string;
  location: string | null;
};

export type IrritationForecast = {
  nationalCount: number;
  regionalMessage: string;
  prefectureMessage: string;
  peakTimeMessage: string;
};

type LocationRule = { prefecture: string; region: string };

const locationRules: LocationRule[] = [
  { prefecture: "北海道", region: "北海道" },
  { prefecture: "青森", region: "東北" }, { prefecture: "岩手", region: "東北" }, { prefecture: "宮城", region: "東北" }, { prefecture: "秋田", region: "東北" }, { prefecture: "山形", region: "東北" }, { prefecture: "福島", region: "東北" },
  { prefecture: "茨城", region: "関東" }, { prefecture: "栃木", region: "関東" }, { prefecture: "群馬", region: "関東" }, { prefecture: "埼玉", region: "関東" }, { prefecture: "千葉", region: "関東" }, { prefecture: "東京", region: "関東" }, { prefecture: "神奈川", region: "関東" },
  { prefecture: "新潟", region: "中部" }, { prefecture: "富山", region: "中部" }, { prefecture: "石川", region: "中部" }, { prefecture: "福井", region: "中部" }, { prefecture: "山梨", region: "中部" }, { prefecture: "長野", region: "中部" }, { prefecture: "岐阜", region: "中部" }, { prefecture: "静岡", region: "中部" }, { prefecture: "愛知", region: "中部" },
  { prefecture: "三重", region: "関西" }, { prefecture: "滋賀", region: "関西" }, { prefecture: "京都", region: "関西" }, { prefecture: "大阪", region: "関西" }, { prefecture: "兵庫", region: "関西" }, { prefecture: "奈良", region: "関西" }, { prefecture: "和歌山", region: "関西" },
  { prefecture: "鳥取", region: "中国" }, { prefecture: "島根", region: "中国" }, { prefecture: "岡山", region: "中国" }, { prefecture: "広島", region: "中国" }, { prefecture: "山口", region: "中国" },
  { prefecture: "徳島", region: "四国" }, { prefecture: "香川", region: "四国" }, { prefecture: "愛媛", region: "四国" }, { prefecture: "高知", region: "四国" },
  { prefecture: "福岡", region: "九州" }, { prefecture: "佐賀", region: "九州" }, { prefecture: "長崎", region: "九州" }, { prefecture: "熊本", region: "九州" }, { prefecture: "大分", region: "九州" }, { prefecture: "宮崎", region: "九州" }, { prefecture: "鹿児島", region: "九州" }, { prefecture: "沖縄", region: "沖縄" },
];

const regionNames = ["北海道", "東北", "関東", "中部", "関西", "中国", "四国", "九州", "沖縄"];

function findLocation(location: string | null) {
  const normalized = location?.replace(/[\s　]/g, "") ?? "";
  const rule = locationRules.find(({ prefecture }) => normalized.includes(prefecture));
  if (rule) return rule;
  const region = regionNames.find((name) => normalized.includes(name));
  return region ? { prefecture: null, region } : { prefecture: null, region: null };
}

function toCountMap(values: Array<string | null>) {
  const counts = new Map<string, number>();
  values.filter((value): value is string => Boolean(value)).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0] ?? null;
}

function japanHour(timestamp: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tokyo", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(timestamp));
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0);
}

export function buildIrritationForecast(creations: VesselCreationForWeather[], profiles: ProfileLocation[], nationalCount: number): IrritationForecast {
  const locationsByUser = new Map(profiles.map((profile) => [profile.id, findLocation(profile.location)]));
  const locations = creations.map((creation) => locationsByUser.get(creation.user_id) ?? { prefecture: null, region: null });
  const topRegion = toCountMap(locations.map((location) => location.region));
  const topPrefecture = toCountMap(locations.map((location) => location.prefecture));
  const afternoonCount = creations.filter((creation) => japanHour(creation.created_at) >= 12).length;
  const morningCount = creations.filter((creation) => japanHour(creation.created_at) >= 5 && japanHour(creation.created_at) < 12).length;
  const timeLabel = afternoonCount > morningCount ? "午後から" : morningCount > afternoonCount ? "午前中から" : "今日は一日を通して";

  return {
    nationalCount,
    regionalMessage: topRegion ? `${topRegion[0]}がイライラしています。今日は${topRegion[1]}個の器が生まれました。` : "地域の入力が集まると、地域別のイライラを表示します。",
    prefectureMessage: topPrefecture ? `${topPrefecture[0]}は${timeLabel}、イライラしているようです。` : "都道府県まで入力すると、もっと細かい予報になります。",
    peakTimeMessage: creations.length === 0 ? "今日はまだ落ち着いているようです。" : afternoonCount > morningCount ? "午後から、ストレスが多いようです。" : morningCount > afternoonCount ? "午前中から、ストレスが多いようです。" : "今日は一日を通して、ストレスが多いようです。",
  };
}
