export type VesselAbility =
  | "poison"
  | "burn"
  | "attackSlow"
  | "thunder"
  | "doubleThrow"
  | "lifeSteal"
  | "reverse"
  | "moveSlow"
  | "defense"
  | "debuffImmune"
  | "invisible"
  | "spectacle";

export type Vessel = {
  attack: number;
  ability: VesselAbility;
  abilityLabel: string;
  abilityDescription: string;
  id: string;
  name: string;
  imageUrl: string;
  feature: string;
  hp: number;
};
