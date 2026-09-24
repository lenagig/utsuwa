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
type ResultSource = "input" | "catalog";

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
  const [resultSource, setResultSource] = useState<ResultSource>("input");
  const [catalogPageIndex, setCatalogPageIndex] = useState(0);
  const [irritationText, setIrritationText] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [battleVesselId, setBattleVesselId] = useState<string | null>(null);
  const [unlockedVesselIds, setUnlockedVesselIds] =
    useState<string[]>(readUnlockedVesselIds);
  const [dailyGeneration, setDailyGeneration] =
    useState<DailyGeneration>(readDailyGeneration);
  const unlockedVessels = vessels.filter((vessel) =>
    unlockedVesselIds.includes(vessel.id)
  );
  const battleVessel =
    unlockedVessels.find((vessel) => vessel.id === battleVesselId) ??
    unlockedVessels.find((vessel) => vessel.id === selectedVessel?.id) ??
    unlockedVessels[0] ??
    null;

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
    setResultSource("input");
    unlockVessel(nextVessel.id);
    countDailyGeneration();
    setView("result");
  }

  function handleOpenVessel(vessel: Vessel) {
    const vesselIndex = vessels.findIndex((catalogVessel) => catalogVessel.id === vessel.id);

    if (vesselIndex >= 0) {
      setCatalogPageIndex(Math.floor(vesselIndex / 8));
    }

    setSelectedVessel(vessel);
    setIrritationText("図鑑から選んだ器です。");
    setResultSource("catalog");
    setView("result");
  }

  if (view === "result" && selectedVessel) {
    return (
      <ResultScreen
        irritationText={irritationText}
        vessel={selectedVessel}
        onBack={() => setView(resultSource === "catalog" ? "catalog" : "title")}
        onBattle={() => {
          setBattleVesselId(selectedVessel.id);
          setView("battle");
        }}
        showOwner={resultSource === "input"}
      />
    );
  }

  if (view === "catalog") {
    return (
      <CatalogScreen
        onBack={() => setView("title")}
        onPageChange={setCatalogPageIndex}
        onOpenVessel={handleOpenVessel}
        pageIndex={catalogPageIndex}
        unlockedVesselIds={unlockedVesselIds}
        vessels={vessels}
      />
    );
  }

  if (view === "battle") {
    return (
      <BattleScreen
        onBack={() => setView("title")}
        onSelectVessel={setBattleVesselId}
        selectedVessel={battleVessel}
        vessels={unlockedVessels}
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
