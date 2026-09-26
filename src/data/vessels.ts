import type { Vessel } from "@/types/vessel";

export const vessels: Vessel[] = [
  {
    id: "goblin-mug", attack: 20, hp: 58,
    ability: "poison", abilityLabel: "毒のよだれ", abilityDescription: "命中後3秒間、毎秒2ダメージ。",
    name: "ゴブリンが舐め倒したマグカップ",
    imageUrl: "/images/vessels/goblin-mug.png",
    feature: "距離感がおかしい。人の物を雑に扱い、妙に不快な記憶だけを残していく。",
  },
  {
    id: "extra-thick-tumbler", attack: 22, hp: 76,
    ability: "burn", abilityLabel: "灼熱保温", abilityDescription: "命中後3秒間、毎秒2ダメージ。",
    name: "極太タンブラー",
    imageUrl: "/images/vessels/extra-thick-tumbler.png",
    feature: "声も態度も圧が強く、いつの間にか場を占領している。",
  },
  {
    id: "social-bin", attack: 20, hp: 43,
    ability: "attackSlow", abilityLabel: "不法投棄", abilityDescription: "命中後3秒間、相手の投擲速度を30%低下。",
    name: "社会のゴミ箱",
    imageUrl: "/images/vessels/social-bin.png",
    feature: "責任や面倒事を、人に押し付けて立ち去る。",
  },
  {
    id: "biwako-weapon", attack: 20, hp: 92,
    ability: "thunder", abilityLabel: "琵琶湖雷撃", abilityDescription: "命中1秒後、相手がいた場所に8ダメージの雷。",
    name: "琵琶湖の最終兵器",
    imageUrl: "/images/vessels/biwako-weapon.png",
    feature: "普段は静か。でも限界を超えると一気に爆発する。",
  },
  {
    id: "poison-bento", attack: 11, hp: 66,
    ability: "doubleThrow", abilityLabel: "二段盛り", abilityDescription: "常に2つ同時に投げる。火力は0.6倍。",
    name: "毒指入り弁当箱",
    imageUrl: "/images/vessels/poison-bento.png",
    feature: "善意のように見せかけて、余計なお世話や嫌がらせを混ぜてくる。",
  },
  {
    id: "heirloom-salad-bowl", attack: 20, hp: 87,
    ability: "lifeSteal", abilityLabel: "思い出の吸収", abilityDescription: "与えたダメージの25%を回復。",
    name: "親の形見サラダボウル",
    imageUrl: "/images/vessels/heirloom-salad-bowl.png",
    feature: "思い出や大切なものを、あまりに軽く扱ってしまう。",
  },
  {
    id: "salmonella-ramen", attack: 20, hp: 52,
    ability: "reverse", abilityLabel: "菌の錯覚", abilityDescription: "命中後2.5秒間、左右操作を反転。",
    name: "サルモネラ菌入りラーメンどんぶり",
    imageUrl: "/images/vessels/salmonella-ramen.png",
    feature: "見た目はよさそうなのに、中身や対応がびっくりするほど危ない。",
  },
  {
    id: "cynical-coolerbox", attack: 20, hp: 80,
    ability: "moveSlow", abilityLabel: "冷笑凍結", abilityDescription: "命中後2.5秒間、移動速度を45%低下。",
    name: "冷笑系クーラーBOX",
    imageUrl: "/images/vessels/cynical-coolerbox.png",
    feature: "何にでも『はいはい』『意識高いね』と冷やした笑いを返してくる。",
  },
  {
    id: "politician-safe", attack: 20, hp: 98,
    ability: "defense", abilityLabel: "鉄壁の説明責任", abilityDescription: "命中すると3秒間、自分の被ダメージを20%軽減。",
    name: "政治家の金庫",
    imageUrl: "/images/vessels/politician-safe.png",
    feature: "お金・約束・責任の話になると、急に中身を見せなくなる。",
  },
  {
    id: "north-korea-eye-drops", attack: 20, hp: 64,
    ability: "debuffImmune", abilityLabel: "国家機密の耐性", abilityDescription: "毒・火傷・操作系デバフを無効化。",
    name: "北朝鮮の目薬",
    imageUrl: "/images/vessels/north-korea-eye-drops.png",
    feature: "こちらが何も聞いていないのに、独自の厳格なルールと手順を押しつけてくる。",
  },
  {
    id: "corpse-cocktail", attack: 22, hp: 71,
    ability: "invisible", abilityLabel: "亡者の隠し味", abilityDescription: "見えにくい器を投げる。投擲速度は35%低下。",
    name: "死骸煮込みカクテル",
    imageUrl: "/images/vessels/corpse-cocktail.png",
    feature: "古い恨みや失敗談を、何度も煮込むように蒸し返す。",
  },
  {
    id: "two-month-candy-pocket", attack: 20, hp: 28,
    ability: "spectacle", abilityLabel: "狂宴の使い魔", abilityDescription: "守護神と猫が現れる。見た目だけで効果はない。",
    name: "飴玉2カ月熟成ポケット",
    imageUrl: "/images/vessels/two-month-candy-pocket.png",
    feature: "不衛生でだらしないのに、それを平然と人へ渡してくる。",
  },
];

export function selectVesselForInput(inputText: string) {
  const source = inputText.trim() || "どんな人だったか、まだ言葉にならない。";
  const score = Array.from(source).reduce(
    (total, character) => total + (character.codePointAt(0) ?? 0),
    0,
  );

  return vessels[score % vessels.length];
}
