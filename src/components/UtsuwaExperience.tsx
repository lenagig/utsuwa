"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AuthScreen } from "@/components/AuthScreen";
import { BattleScreen } from "@/components/BattleScreen";
import { CatalogScreen } from "@/components/CatalogScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { TitleScreen } from "@/components/TitleScreen";
import { WeatherScreen } from "@/components/WeatherScreen";
import { vessels } from "@/data/vessels";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { IrritationForecast } from "@/lib/irritation-weather";
import type { Vessel } from "@/types/vessel";

type View = "title" | "auth" | "result" | "catalog" | "battle" | "weather";
type ResultSource = "input" | "catalog";

type AccountResponse = {
  profile: { username: string; location: string | null } | null;
  unlockedVesselIds: string[];
  nationalTodayCount: number;
  irritationForecast: IrritationForecast;
};

export function UtsuwaExperience() {
  const [view, setView] = useState<View>("title");
  const [session, setSession] = useState<Session | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [resultSource, setResultSource] = useState<ResultSource>("input");
  const [catalogAnchorIndex, setCatalogAnchorIndex] = useState(0);
  const [irritationText, setIrritationText] = useState("");
  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(null);
  const [battleVesselId, setBattleVesselId] = useState<string | null>(null);
  const [unlockedVesselIds, setUnlockedVesselIds] = useState<string[]>([]);
  const [nationalTodayCount, setNationalTodayCount] = useState(0);
  const [irritationForecast, setIrritationForecast] = useState<IrritationForecast | null>(null);

  const unlockedVessels = vessels.filter((vessel) => unlockedVesselIds.includes(vessel.id));
  const battleVessel =
    unlockedVessels.find((vessel) => vessel.id === battleVesselId) ??
    unlockedVessels.find((vessel) => vessel.id === selectedVessel?.id) ??
    unlockedVessels[0] ??
    null;

  const refreshAccount = useCallback(async (nextSession: Session | null) => {
    if (!nextSession) {
      setUsername(null);
      setUnlockedVesselIds([]);
      setNationalTodayCount(0);
      setIrritationForecast(null);
      return;
    }

    const response = await fetch("/api/account", {
      headers: { Authorization: `Bearer ${nextSession.access_token}` },
    });
    if (!response.ok) return;
    const data = (await response.json()) as AccountResponse;
    setUsername(data.profile?.username ?? nextSession.user.user_metadata.username ?? null);
    setUnlockedVesselIds(data.unlockedVesselIds);
    setNationalTodayCount(data.nationalTodayCount);
    setIrritationForecast(data.irritationForecast);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void refreshAccount(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void refreshAccount(nextSession);
    });
    return () => listener.subscription.unsubscribe();
  }, [refreshAccount]);

  async function chooseWithGemini(inputText: string) {
    if (!session) throw new Error("ログインが必要です。");
    const response = await fetch("/api/select-vessel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ inputText }),
    });
    const result = (await response.json()) as {
      error?: string;
      nationalTodayCount?: number;
      vesselId?: string;
    };
    if (!response.ok || !result.vesselId) throw new Error(result.error ?? "器を選べませんでした。");
    const vessel = vessels.find((candidate) => candidate.id === result.vesselId);
    if (!vessel) throw new Error("存在しない器が選ばれました。");
    return { vessel, nationalTodayCount: result.nationalTodayCount ?? nationalTodayCount };
  }

  async function handleSelectVessel(inputText: string) {
    if (!session) {
      setView("auth");
      return;
    }
    try {
      const result = await chooseWithGemini(inputText);
      setIrritationText(inputText.trim());
      setSelectedVessel(result.vessel);
      setResultSource("input");
      setUnlockedVesselIds((current) => [...new Set([...current, result.vessel.id])]);
      setNationalTodayCount(result.nationalTodayCount);
      setView("result");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "器を選べませんでした。");
    }
  }

  function handleOpenVessel(vessel: Vessel) {
    const vesselIndex = vessels.findIndex((item) => item.id === vessel.id);
    if (vesselIndex >= 0) setCatalogAnchorIndex(vesselIndex);
    setSelectedVessel(vessel);
    setIrritationText("図鑑から選んだ器です。");
    setResultSource("catalog");
    setView("result");
  }

  async function handleSignOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
  }

  if (view === "auth") {
    return <AuthScreen onAuthenticated={async () => {
      const nextSession = (await getSupabaseBrowserClient()?.auth.getSession())?.data.session ?? null;
      setSession(nextSession);
      await refreshAccount(nextSession);
    }} onBack={() => setView("title")} />;
  }

  if (view === "result" && selectedVessel) {
    return <ResultScreen irritationText={irritationText} vessel={selectedVessel} onBack={() => setView(resultSource === "catalog" ? "catalog" : "title")} onBattle={() => { setBattleVesselId(selectedVessel.id); setView("battle"); }} showOwner={resultSource === "input"} />;
  }

  if (view === "catalog") {
    return <CatalogScreen onBack={() => setView("title")} onPageChange={setCatalogAnchorIndex} onOpenVessel={handleOpenVessel} anchorIndex={catalogAnchorIndex} unlockedVesselIds={unlockedVesselIds} vessels={vessels} />;
  }

  if (view === "battle") {
    return <BattleScreen onBack={() => setView("title")} onSelectVessel={setBattleVesselId} selectedVessel={battleVessel} vessels={unlockedVessels} />;
  }

  if (view === "weather") {
    return <WeatherScreen nationalTodayCount={nationalTodayCount} forecast={irritationForecast} onBack={() => setView("title")} />;
  }

  return <TitleScreen onOpenAuth={() => setView("auth")} onOpenBattle={() => setView("battle")} onOpenCatalog={() => setView("catalog")} onOpenWeather={() => setView("weather")} onSelectVessel={handleSelectVessel} onSignOut={handleSignOut} username={username} />;
}
