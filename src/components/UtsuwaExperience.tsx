"use client";

import { useState } from "react";
import { selectVesselForInput, vessels } from "@/data/vessels";
import { BattleScreen } from "@/components/BattleScreen";
import { CatalogScreen } from "@/components/CatalogScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { TitleScreen } from "@/components/TitleScreen";
import { WeatherScreen } from "@/components/WeatherScreen";
import type { Vessel } from "@/types/vessel";

type View = "title" | "result" | "catalog" | "battle" | "weather";

type DailyGeneration = {
  count: number;
  date: string;
};

const unlockedStorageKey = "utsuwa-unlocked-vessels";
const dailyStorageKey = "utsuwa-daily-generation";

function getTodayKey() {
  return new Date().toLocaleDateString("ja-JP");
}

function createDailyGeneration(): DailyGeneration {
  return {
    count: 0,
    date: getTodayKey()
  };
}

function readUnlockedVesselIds() {
  if (typeof window === "undefined") {
    return [];
  }

  const storedUnlocked = window.localStorage.getItem(unlockedStorageKey);
  return storedUnlocked ? (JSON.parse(storedUnlocked) as string[]) : [];
}

function readDailyGeneration() {
  if (typeof window === "undefined") {
    return createDailyGeneration();
  }

  const storedDaily = window.localStorage.getItem(dailyStorageKey);

  if (!storedDaily) {
    return createDailyGeneration();
  }

  const parsedDaily = JSON.parse(storedDaily) as DailyGeneration;
  return parsedDaily.date === getTodayKey()
    ? parsedDaily
    : createDailyGeneration();
}

export function UtsuwaExperience() {
  const [view, setView] = useState<View>("title");
  const [irritationText, setIrritationText] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [unlockedVesselIds, setUnlockedVesselIds] =
    useState<string[]>(readUnlockedVesselIds);
  const [dailyGeneration, setDailyGeneration] =
    useState<DailyGeneration>(readDailyGeneration);

  function unlockVessel(vesselId: string) {
    setUnlockedVesselIds((currentIds) => {
      if (currentIds.includes(vesselId)) {
        return currentIds;
      }

      const nextIds = [...currentIds, vesselId];
      window.localStorage.setItem(unlockedStorageKey, JSON.stringify(nextIds));
      return nextIds;
    });
  }

  function countDailyGeneration() {
    setDailyGeneration((currentDaily) => {
      const baseDaily =
        currentDaily.date === getTodayKey()
          ? currentDaily
          : createDailyGeneration();
      const nextDaily = {
        ...baseDaily,
        count: baseDaily.count + 1
      };

      window.localStorage.setItem(dailyStorageKey, JSON.stringify(nextDaily));
      return nextDaily;
    });
  }

  function handleSelectVessel(inputText: string) {
    const nextVessel = selectVesselForInput(inputText);

    setIrritationText(inputText.trim());
    setSelectedVessel(nextVessel);
    unlockVessel(nextVessel.id);
    countDailyGeneration();
    setView("result");
  }

  function handleOpenVessel(vessel: Vessel) {
    setSelectedVessel(vessel);
    setIrritationText("図鑑から選んだ器です。");
    setView("result");
  }

  if (view === "result" && selectedVessel) {
    return (
      <ResultScreen
        irritationText={irritationText}
        vessel={selectedVessel}
        onBack={() => setView("title")}
        onBattle={() => setView("battle")}
      />
    );
  }

  if (view === "catalog") {
    return (
      <CatalogScreen
        onBack={() => setView("title")}
        onOpenVessel={handleOpenVessel}
        unlockedVesselIds={unlockedVesselIds}
        vessels={vessels}
      />
    );
  }

  if (view === "battle") {
    return (
      <BattleScreen
        onBack={() => setView("title")}
        selectedVessel={selectedVessel}
      />
    );
  }

  if (view === "weather") {
    return (
      <WeatherScreen
        dailyGeneration={dailyGeneration}
        onBack={() => setView("title")}
      />
    );
  }

  return (
    <TitleScreen
      onOpenBattle={() => setView("battle")}
      onOpenCatalog={() => setView("catalog")}
      onOpenWeather={() => setView("weather")}
      onSelectVessel={handleSelectVessel}
    />
  );
}
