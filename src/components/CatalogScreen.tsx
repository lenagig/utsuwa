/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Vessel } from "@/types/vessel";
import screen from "@/components/Screen.module.css";
import styles from "@/components/CatalogScreen.module.css";

type CatalogScreenProps = {
  onBack: () => void;
  onPageChange: (anchorIndex: number) => void;
  onOpenVessel: (vessel: Vessel) => void;
  anchorIndex: number;
  unlockedVesselIds: string[];
  vessels: Vessel[];
};

export function CatalogScreen({
  onBack,
  onPageChange,
  onOpenVessel,
  anchorIndex,
  unlockedVesselIds,
  vessels
}: CatalogScreenProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateLayout = () => setIsMobile(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);
    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  const pageSize = isMobile ? 4 : 8;
  const totalPages = Math.max(1, Math.ceil(vessels.length / pageSize));
  const pageIndex = Math.min(Math.floor(anchorIndex / pageSize), totalPages - 1);
  const visibleVessels = useMemo(
    () => vessels.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize),
    [pageIndex, pageSize, vessels]
  );
  const pageSlots = Array.from({ length: pageSize }, (_, index) => visibleVessels[index]);
  const canGoPrevious = pageIndex > 0;
  const canGoNext = pageIndex < totalPages - 1;

  return (
    <main className={`${screen.titlePage} ${styles.catalogPage}`}>
      <section className={styles.catalogPanel} aria-labelledby="catalog-title">
        <h1 className={styles.catalogTitle} id="catalog-title">
          図鑑
        </h1>

        <div className={styles.catalogBook}>
          <div className={styles.catalogSpread}>
            <div className={styles.catalogPageGrid}>
              {pageSlots.slice(0, 4).map((vessel, index) => (
                <CatalogCard
                  key={vessel?.id ?? `left-empty-${index}`}
                  onOpenVessel={onOpenVessel}
                  unlockedVesselIds={unlockedVesselIds}
                  vessel={vessel}
                />
              ))}
            </div>

            <div className={styles.catalogPageGrid}>
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

        <div className={styles.catalogControls}>
          <button
            aria-label="前のページ"
            className={styles.catalogArrow}
            disabled={!canGoPrevious}
            onClick={() => onPageChange((pageIndex - 1) * pageSize)}
            type="button"
          >
            ‹
          </button>
          <span className={styles.catalogPageNumber}>
            {pageIndex + 1} / {totalPages}
          </span>
          <button
            aria-label="次のページ"
            className={styles.catalogArrow}
            disabled={!canGoNext}
            onClick={() => onPageChange((pageIndex + 1) * pageSize)}
            type="button"
          >
            ›
          </button>
        </div>

        <button
          className={`${screen.secondaryAction} ${styles.catalogBack}`}
          onClick={onBack}
          type="button"
        >
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
    return <div className={`${styles.catalogCard} ${styles.empty}`} />;
  }

  const isUnlocked = unlockedVesselIds.includes(vessel.id);

  return (
    <button
      className={`${styles.catalogCard} ${isUnlocked ? "" : styles.locked}`}
      disabled={!isUnlocked}
      onClick={() => onOpenVessel(vessel)}
      type="button"
    >
      <img alt={isUnlocked ? vessel.name : "未解放の器"} src={vessel.imageUrl} />
      <span>{isUnlocked ? vessel.name : "？"}</span>
    </button>
  );
}
