/* eslint-disable @next/next/no-img-element */
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
  return (
    <main className="titlePage catalogPage">
      <section className="catalogPanel" aria-labelledby="catalog-title">
        <h1 className="catalogTitle" id="catalog-title">
          図鑑
        </h1>

        <div className="catalogBook">
          <div className="catalogGrid">
            {vessels.map((vessel) => {
              const isUnlocked = unlockedVesselIds.includes(vessel.id);

              return (
                <button
                  className={`catalogCard ${isUnlocked ? "" : "locked"}`}
                  disabled={!isUnlocked}
                  key={vessel.id}
                  onClick={() => onOpenVessel(vessel)}
                  type="button"
                >
                  <img
                    alt={isUnlocked ? vessel.name : "未解放の器"}
                    src={vessel.imageUrl}
                  />
                  <span>{isUnlocked ? vessel.name : "？"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button className="secondaryAction catalogBack" onClick={onBack} type="button">
          戻る
        </button>
      </section>
    </main>
  );
}
