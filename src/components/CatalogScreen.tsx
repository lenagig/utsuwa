/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import type { Vessel } from "@/types/vessel";

type CatalogScreenProps = {
  onBack: () => void;
  onOpenVessel: (vessel: Vessel) => void;
  unlockedVesselIds: string[];
  vessels: Vessel[];
};

export function CatalogScreen({
  onBack,
  onOpenVessel,
  unlockedVesselIds,
  vessels
}: CatalogScreenProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 8;
  const totalPages = Math.ceil(vessels.length / pageSize);
  const visibleVessels = useMemo(
    () => vessels.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [pageIndex, vessels]
  );
  const pageSlots = Array.from({ length: pageSize }, (_, index) => visibleVessels[index]);
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < totalPages - 1;

  return (
    <main className="titlePage catalogPage">
      <section className="catalogPanel" aria-labelledby="catalog-title">
        <h1 className="catalogTitle" id="catalog-title">
          図鑑
        </h1>

        <div className="catalogBook">
          <div className="catalogSpread">
            <div className="catalogPageGrid">
              {pageSlots.slice(0, 4).map((vessel, index) => (
                <CatalogCard
                  key={vessel?.id ?? `left-empty-${index}`}
                  onOpenVessel={onOpenVessel}
                  unlockedVesselIds={unlockedVesselIds}
                  vessel={vessel}
                />
              ))}
            </div>

            <div className="catalogPageGrid">
              {pageSlots.slice(4, 8).map((vessel, index) => (
                <CatalogCard
                  key={vessel?.id ?? `right-empty-${index}`}
                  onOpenVessel={onOpenVessel}
                  unlockedVesselIds={unlockedVesselIds}
                  vessel={vessel}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="catalogControls">
          <button
            aria-label="前のページ"
            className="catalogArrow"
            disabled={!canGoPrevious}
            onClick={() => setPageIndex((current) => current - 1)}
            type="button"
          >
            ‹
          </button>
          <span className="catalogPageNumber">
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            aria-label="次のページ"
            className="catalogArrow"
            disabled={!canGoNext}
            onClick={() => setPageIndex((current) => current + 1)}
            type="button"
          >
            ›
          </button>
        </div>

        <button className="secondaryAction catalogBack" onClick={onBack} type="button">
          戻る
        </button>
      </section>
    </main>
  );
}

type CatalogCardProps = {
  onOpenVessel: (vessel: Vessel) => void;
  unlockedVesselIds: string[];
  vessel?: Vessel;
};

function CatalogCard({
  onOpenVessel,
  unlockedVesselIds,
  vessel
}: CatalogCardProps) {
  if (!vessel) {
    return <div className="catalogCard empty" />;
  }

  const isUnlocked = unlockedVesselIds.includes(vessel.id);

  return (
    <button
      className={`catalogCard ${isUnlocked ? "" : "locked"}`}
      disabled={!isUnlocked}
      onClick={() => onOpenVessel(vessel)}
      type="button"
    >
      <img alt={isUnlocked ? vessel.name : "未解放の器"} src={vessel.imageUrl} />
      <span>{isUnlocked ? vessel.name : "？"}</span>
    </button>
  );
}
