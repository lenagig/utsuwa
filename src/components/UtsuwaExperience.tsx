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
type DailyGeneration = { count: number; date: string };

const unlockedStorageKey = "utsuwa-unlocked-vessels";
const dailyStorageKey = "utsuwa-daily-generation";
const getTodayKey = () => new Date().toLocaleDateString("ja-JP");
const createDailyGeneration = (): DailyGeneration => ({ count: 0, date: getTodayKey() });

function readUnlockedVesselIds() {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(unlockedStorageKey);
  return stored ? (JSON.parse(stored) as string[]) : [];
}

function readDailyGeneration() {
  if (typeof window === "undefined") return createDailyGeneration();
  const stored = window.localStorage.getItem(dailyStorageKey);
  if (!stored) return createDailyGeneration();
  const daily = JSON.parse(stored) as DailyGeneration;
  return daily.date === getTodayKey() ? daily : createDailyGeneration();
}

export function UtsuwaExperience() {
  const [view, setView] = useState<View>("title");
  const [resultSource, setResultSource] = useState<ResultSource>("input");
  const [catalogPageIndex, setCatalogPageIndex] = useState(0);
  const [irritationText, setIrritationText] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [unlockedVesselIds, setUnlockedVesselIds] = useState<string[]>(readUnlockedVesselIds);
  const [dailyGeneration, setDailyGeneration] = useState<DailyGeneration>(readDailyGeneration);

  function unlockVessel(vesselId: string) {
    setUnlockedVesselIds((current) => {
      if (current.includes(vesselId)) return current;
      const next = [...current, vesselId];
      window.localStorage.setItem(unlockedStorageKey, JSON.stringify(next));
      return next;
    });
  }

  function countDailyGeneration() {
    setDailyGeneration((current) => {
      const base = current.date === getTodayKey() ? current : createDailyGeneration();
      const next = { ...base, count: base.count + 1 };
      window.localStorage.setItem(dailyStorageKey, JSON.stringify(next));
      return next;
    });
  }

  async function chooseWithGemini(inputText: string) {
    const fallback = selectVesselForInput(inputText);
    try {
      const response = await fetch("/api/select-vessel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputText })
      });
      if (!response.ok) return fallback;
      const result = (await response.json()) as { vesselId?: string };
      return vessels.find((vessel) => vessel.id === result.vesselId) ?? fallback;
    } catch {
      return fallback;
    }
  }

  async function handleSelectVessel(inputText: string) {
    const nextVessel = await chooseWithGemini(inputText);
    setIrritationText(inputText.trim());
    setSelectedVessel(nextVessel);
    setResultSource("input");
    unlockVessel(nextVessel.id);
    countDailyGeneration();
    setView("result");
  }

  function handleOpenVessel(vessel: Vessel) {
    const index = vessels.findIndex((item) => item.id === vessel.id);
    if (index >= 0) setCatalogPageIndex(Math.floor(index / 8));
    setSelectedVessel(vessel);
    setIrritationText("図鑑から選んだ器です。");
    setResultSource("catalog");
    setView("result");
  }

  if (view === "result" && selectedVessel) return <ResultScreen irritationText={irritationText} vessel={selectedVessel} onBack={() => setView(resultSource === "catalog" ? "catalog" : "title")} onBattle={() => setView("battle")} showOwner={resultSource === "input"} />;
  if (view === "catalog") return <CatalogScreen onBack={() => setView("title")} onPageChange={setCatalogPageIndex} onOpenVessel={handleOpenVessel} pageIndex={catalogPageIndex} unlockedVesselIds={unlockedVesselIds} vessels={vessels} />;
  if (view === "battle") return <BattleScreen onBack={() => setView("title")} selectedVessel={selectedVessel} />;
  if (view === "weather") return <WeatherScreen dailyGeneration={dailyGeneration} onBack={() => setView("title")} />;
  return <TitleScreen onOpenBattle={() => setView("battle")} onOpenCatalog={() => setView("catalog")} onOpenWeather={() => setView("weather")} onSelectVessel={handleSelectVessel} />;
}
