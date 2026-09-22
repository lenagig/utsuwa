"use client";

import { useState } from "react";
import { mockSelectedVessel } from "@/data/vessels";
import { ResultScreen } from "@/components/ResultScreen";
import { TitleScreen } from "@/components/TitleScreen";

export function UtsuwaExperience() {
  const [view, setView] = useState<"title" | "result">("title");
  const [irritationText, setIrritationText] = useState("");

  function handleSelectVessel(inputText: string) {
    setIrritationText(inputText.trim());
    setView("result");
  }

  if (view === "result") {
    return (
      <ResultScreen
        irritationText={irritationText}
        vessel={mockSelectedVessel}
        onBack={() => setView("title")}
      />
    );
  }

  return <TitleScreen onSelectVessel={handleSelectVessel} />;
}
