import type { Vessel } from "@/types/vessel";

export const vessels: Vessel[] = [
  {
    id: "goblin-mug",
    name: "ゴブリンが舐め倒したマグカップ",
    imageUrl: "/images/vessels/goblin-mug.png",
    feature: "不快なほど記憶に残る、ぬめり気味の一杯。"
  },
  {
    id: "godslayer-tumbler",
    name: "神殺しのタンブラー",
    imageUrl: "/images/vessels/godslayer-tumbler.png",
    feature: "信念まで冷たく、熱く保つ黒い器。"
  },
  {
    id: "social-bin",
    name: "社会のゴミ箱",
    imageUrl: "/images/vessels/social-bin.png",
    feature: "見て見ぬふりされたものを、全部ため込む。"
  },
  {
    id: "eel-bath",
    name: "電気ウナギの浴槽",
    imageUrl: "/images/vessels/eel-bath.png",
    feature: "近づくほど、じわりとしびれる。"
  },
  {
    id: "biwako-weapon",
    name: "琵琶湖の最終兵器",
    imageUrl: "/images/vessels/biwako-weapon.png",
    feature: "静かな水面の下に、切り札を隠している。"
  },
  {
    id: "poison-bento",
    name: "200度の毒指入り弁当箱",
    imageUrl: "/images/vessels/poison-bento.png",
    feature: "熱さと危うさを、きっちり閉じ込めた器。"
  },
  {
    id: "heirloom-salad-bowl",
    name: "親の形見サラダボウル",
    imageUrl: "/images/vessels/heirloom-salad-bowl.png",
    feature: "思い出まで、やさしく盛りつける。"
  },
  {
    id: "salmonella-ramen",
    name: "サルモネラ菌入りラーメンどんぶり",
    imageUrl: "/images/vessels/salmonella-ramen.png",
    feature: "見た目はおいしそう。でも油断は禁物。"
  },
  {
    id: "life-coolerbox",
    name: "人生のクーラーBOX",
    imageUrl: "/images/vessels/life-coolerbox.png",
    feature: "熱くなりすぎた気持ちを、いったん冷やす。"
  },
  {
    id: "world-safe",
    name: "世界の金庫",
    imageUrl: "/images/vessels/world-safe.png",
    feature: "大事なものを、重く静かに守り抜く。"
  },
  {
    id: "ethics-pool",
    name: "政治家の倫理観プール",
    imageUrl: "/images/vessels/ethics-pool.png",
    feature: "深そうに見えて、足首ほどの深さ。"
  },
  {
    id: "corpse-cocktail",
    name: "死骸煮込みカクテル",
    imageUrl: "/images/vessels/corpse-cocktail.png",
    feature: "禁断の材料を、優雅な一杯にしたもの。"
  },
  {
    id: "africa-champagne",
    name: "アフリカ産シャンパングラス",
    imageUrl: "/images/vessels/africa-champagne.png",
    feature: "遠い土地の時間を映した、繊細なグラス。"
  },
  {
    id: "daiso-pot",
    name: "100均の壺",
    imageUrl: "/images/vessels/daiso-pot.png",
    feature: "手軽なのに、意外と抱え込める壺。"
  },
  {
    id: "ordinary-rice-bowl",
    name: "普通の茶碗",
    imageUrl: "/images/vessels/ordinary-rice-bowl.png",
    feature: "派手さはない。でも毎日を受け止める。"
  }
];

export function selectVesselForInput(inputText: string) {
  const source = inputText.trim() || "どんな人だったか、まだ言葉にならない。";
  const score = Array.from(source).reduce(
    (total, character) => total + (character.codePointAt(0) ?? 0),
    0
  );

  return vessels[score % vessels.length];
}
