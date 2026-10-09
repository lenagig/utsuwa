"use client";

import {
  Image as VesselImage,
  PerspectiveCamera as SceneCamera,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { Vessel } from "@/types/vessel";

export type FlyingVessel = {
  id: number;
  owner: "player" | "rival";
  progress: number;
  vessel: Vessel;
  z: number;
  hidden?: boolean;
};

type Props = {
  aiZ: number;
  hit: "player" | "rival" | null;
  player: Vessel | null;
  playerZ: number;
  projectiles: FlyingVessel[];
  rival: Vessel | null;
  shake: number;
  winner: "player" | "rival" | null;
};

type FighterProps = {
  color: string;
  side: -1 | 1;
  z: number;
  throwing: boolean;
  defeated: boolean;
  xOffset: number;
  yOffset: number;
  scale: number;
};

function Fighter({
  color,
  side,
  z,
  throwing,
  defeated,
  xOffset,
  yOffset,
  scale,
}: FighterProps) {
  const root = useRef<Group>(null);
  const arm = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (root.current) root.current.position.z = z;
    if (arm.current) {
      arm.current.rotation.z = throwing
        ? side * -1.2
        : side * (0.05 * Math.sin(clock.getElapsedTime() * 2));
    }
  });

  return (
    <group
      ref={root}
      position={[side * xOffset, yOffset, z]}
      rotation={[0, side * 0.42, defeated ? side * 1.15 : 0]}
      scale={scale}
    >
      <mesh castShadow position={[0, 1.63, 0]}>
        <sphereGeometry args={[0.42, 28, 28]} />
        <meshStandardMaterial color={color} roughness={0.28} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]}>
        <capsuleGeometry args={[0.42, 1.15, 8, 20]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[-0.22, -0.2, 0]}>
        <capsuleGeometry args={[0.16, 0.78, 6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[0.22, -0.2, 0]}>
        <capsuleGeometry args={[0.16, 0.78, 6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <group ref={arm} position={[side * -0.45, 1.05, 0]}>
        <mesh castShadow position={[side * -0.2, -0.42, 0]}>
          <capsuleGeometry args={[0.14, 0.82, 6, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <mesh
        castShadow
        position={[side * 0.45, 0.58, 0]}
        rotation={[0, 0, side * 0.2]}
      >
        <capsuleGeometry args={[0.14, 0.86, 6, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Projectile({
  shot,
  reach,
  scale,
  depthOffset,
}: {
  shot: FlyingVessel;
  reach: number;
  scale: number;
  depthOffset: number;
}) {
  const x =
    shot.owner === "player"
      ? -reach + shot.progress * reach * 2
      : reach - shot.progress * reach * 2;
  const y = -0.1 + Math.sin(shot.progress * Math.PI) * 1.55;

  return (
    <group
      position={[x, y, shot.z + depthOffset]}
      rotation={[0, 0, (shot.owner === "player" ? 1 : -1) * shot.progress * 10]}
      scale={scale}
    >
      <VesselImage
        url={shot.vessel.imageUrl}
        transparent
        opacity={shot.hidden ? 0.22 : 0.98}
        scale={[1.1, 1.1]}
      />
      <mesh position={[0, 0, -0.07]}>
        <circleGeometry args={[0.58, 30]} />
        <meshBasicMaterial
          color={shot.owner === "player" ? "#ef4848" : "#55afff"}
          transparent
          opacity={shot.hidden ? 0.08 : 0.42}
        />
      </mesh>
    </group>
  );
}

function Sparks({ active, color }: { active: boolean; color: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        a: i * 0.74,
        r: 0.15 + (i % 7) * 0.13,
        y: ((i % 6) - 3) * 0.13,
      })),
    [],
  );

  if (!active) return null;

  return (
    <group position={[0, 0.45, 0]}>
      {pieces.map((piece, index) => (
        <mesh
          key={index}
          position={[
            Math.cos(piece.a) * piece.r,
            piece.y,
            Math.sin(piece.a) * piece.r,
          ]}
        >
          <sphereGeometry args={[0.035 + (index % 3) * 0.018, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ aiZ, hit, playerZ, projectiles, shake, winner }: Props) {
  const cameraRig = useRef<Group>(null);
  const { size } = useThree();
  const isMobile = size.width <= 640;
  const fighterOffset = isMobile ? 4.05 : 4.45;
  const fighterDepthOffset = isMobile ? -0.5 : 0;
  const fighterScale = isMobile ? 0.9 : 1;
  const fighterY = isMobile ? -1.025 : -1.22;
  const floorRadius = isMobile ? 4.35 : 6.7;
  const ringInnerRadius = isMobile ? 3.85 : 3.5;
  const ringOuterRadius = isMobile ? 3.95 : 3.59;
  const projectileReach = isMobile ? fighterOffset - 0.4 : 4.05;
  const projectileScale = isMobile ? 1.3 : 1;

  useFrame(({ clock }) => {
    if (cameraRig.current) {
      const amount = shake > 0 ? 0.09 : 0;
      cameraRig.current.position.x = Math.sin(clock.getElapsedTime() * 48) * amount;
      cameraRig.current.position.y = Math.cos(clock.getElapsedTime() * 55) * amount;
    }
  });

  const playerThrowing = projectiles.some((shot) => shot.owner === "player");
  const rivalThrowing = projectiles.some((shot) => shot.owner === "rival");

  const cameraY = isMobile ? 7.1 : 2.25;
  const cameraZ = isMobile ? 27.5 : 12.4;
  const cameraPitch = isMobile ? -Math.atan2(cameraY, cameraZ) : 0;

  return (
    <>
      {isMobile && (
        <SceneCamera
          makeDefault
          fov={45}
          position={[0, cameraY, cameraZ]}
          rotation={[cameraPitch, 0, 0]}
        />
      )}
      <group ref={cameraRig}>
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          color="#ffbd6f"
          intensity={2.8}
          position={[1, 7, 5]}
        />
        <pointLight
          color="#ff5d25"
          intensity={hit ? 10 : 1.2}
          distance={8}
          position={[0, 0.8, 1]}
        />

        <mesh
          receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.7, 0]}
        >
          <circleGeometry args={[floorRadius, 80]} />
          <meshStandardMaterial
            color="#25130c"
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.68, 0]}>
          <ringGeometry args={[ringInnerRadius, ringOuterRadius, 80]} />
          <meshBasicMaterial color="#df9131" transparent opacity={0.9} />
        </mesh>

        <Fighter
          color="#d92e39"
          side={-1}
          z={playerZ + fighterDepthOffset}
          throwing={playerThrowing}
          defeated={winner === "rival"}
          xOffset={fighterOffset}
          yOffset={fighterY}
          scale={fighterScale}
        />
        <Fighter
          color="#2588da"
          side={1}
          z={aiZ + fighterDepthOffset}
          throwing={rivalThrowing}
          defeated={winner === "player"}
          xOffset={fighterOffset}
          yOffset={fighterY}
          scale={fighterScale}
        />
        {projectiles.map((shot) => (
          <Projectile
            key={shot.id}
            shot={shot}
            reach={projectileReach}
            scale={projectileScale}
            depthOffset={fighterDepthOffset}
          />
        ))}
        <Sparks
          active={Boolean(hit)}
          color={hit === "player" ? "#ff6868" : "#78c5ff"}
        />
      </group>
    </>
  );
}

export function BattleArena3D(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 42, position: [0, 2.25, 12.4] }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
