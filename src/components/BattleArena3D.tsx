"use client";

import { Image as DreiImage } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { Vessel } from "@/types/vessel";

export type BattlePhase = "idle" | "windup" | "throw" | "impact" | "result";

type BattleArena3DProps = {
  loser: "player" | "rival" | null;
  phase: BattlePhase;
  player: Vessel | null;
  rival: Vessel | null;
};

function Fighter({ color, side, phase }: { color: string; side: -1 | 1; phase: BattlePhase }) {
  const arm = useRef<Group>(null);
  const fighter = useRef<Group>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const throwing = phase === "throw" || phase === "impact" || phase === "result";
    const windup = phase === "windup";
    if (arm.current) arm.current.rotation.z = throwing ? side * -1.15 : windup ? side * 0.55 : side * (0.06 * Math.sin(time * 1.8));
    if (fighter.current) fighter.current.position.y = 0.03 * Math.sin(time * 1.8 + side);
  });

  return (
    <group ref={fighter} position={[side * 4.35, -1.25, 0]} rotation={[0, side === -1 ? 0.36 : -0.36, 0]}>
      <mesh castShadow position={[0, 1.63, 0]}><sphereGeometry args={[0.42, 32, 32]} /><meshStandardMaterial color={color} roughness={0.34} metalness={0.12} /></mesh>
      <mesh castShadow position={[0, 0.78, 0]}><capsuleGeometry args={[0.42, 1.08, 8, 20]} /><meshStandardMaterial color={color} roughness={0.3} metalness={0.14} /></mesh>
      <mesh castShadow position={[-0.22, -0.2, 0]}><capsuleGeometry args={[0.16, 0.8, 6, 16]} /><meshStandardMaterial color={color} roughness={0.34} /></mesh>
      <mesh castShadow position={[0.22, -0.2, 0]}><capsuleGeometry args={[0.16, 0.8, 6, 16]} /><meshStandardMaterial color={color} roughness={0.34} /></mesh>
      <group ref={arm} position={[side * -0.46, 1.08, 0]}>
        <mesh castShadow position={[side * -0.2, -0.44, 0]} rotation={[0, 0, side * 0.25]}><capsuleGeometry args={[0.14, 0.82, 6, 16]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
      </group>
      <mesh castShadow position={[side * 0.46, 0.58, 0]} rotation={[0, 0, side * -0.18]}><capsuleGeometry args={[0.14, 0.9, 6, 16]} /><meshStandardMaterial color={color} roughness={0.3} /></mesh>
    </group>
  );
}

function Projectile({ vessel, side, phase }: { vessel: Vessel | null; side: -1 | 1; phase: BattlePhase }) {
  const projectile = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!projectile.current) return;
    const t = phase === "idle" ? 0 : phase === "windup" ? 0.06 : phase === "throw" ? 0.72 : 1;
    projectile.current.position.x = side * (3.25 * (1 - t));
    projectile.current.position.y = 0.2 + Math.sin(t * Math.PI) * 1.65;
    projectile.current.rotation.z = side * (clock.getElapsedTime() * 7 + t * 2.2);
    projectile.current.visible = Boolean(vessel);
  });

  return (
    <group ref={projectile} position={[side * 3.25, 0.2, 0.25]}>
      {vessel ? <DreiImage url={vessel.imageUrl} transparent opacity={0.98} scale={[1.18, 1.18]} /> : null}
      <mesh position={[0, 0, -0.08]}><circleGeometry args={[0.61, 32]} /><meshBasicMaterial color={side === -1 ? "#ff4d4d" : "#54b8ff"} transparent opacity={0.4} /></mesh>
    </group>
  );
}

function Shards({ active, color }: { active: boolean; color: string }) {
  const pieces = useMemo(() => Array.from({ length: 24 }, (_, index) => ({
    angle: (index / 24) * Math.PI * 2,
    distance: 0.35 + (index % 5) * 0.16,
    y: ((index % 6) - 2.5) * 0.2,
    size: 0.06 + (index % 3) * 0.03,
  })), []);
  if (!active) return null;
  return <group position={[0, 0.65, 0.18]}>{pieces.map((piece, index) => <mesh key={index} position={[Math.cos(piece.angle) * piece.distance, piece.y, Math.sin(piece.angle) * piece.distance]} rotation={[index, piece.angle, -index]}><tetrahedronGeometry args={[piece.size, 0]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} /></mesh>)}</group>;
}

function ArenaScene({ loser, phase, player, rival }: BattleArena3DProps) {
  const impact = phase === "impact" || phase === "result";
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight castShadow color="#ffba68" intensity={2.4} position={[2, 7, 5]} shadow-mapSize={[1024, 1024]} />
      <pointLight color="#ff4b26" intensity={phase === "impact" ? 9 : 1.1} distance={7} position={[0, 1.1, 1]} />
      <pointLight color="#ffbd6d" intensity={1.2} distance={8} position={[0, 4, -3]} />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.68, 0]}><circleGeometry args={[6.5, 80]} /><meshStandardMaterial color="#26150e" roughness={0.58} metalness={0.45} /></mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.65, 0]}><ringGeometry args={[3.55, 3.62, 80]} /><meshBasicMaterial color="#df8f30" transparent opacity={0.8} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.63, 0]}><ringGeometry args={[5.35, 5.42, 80]} /><meshBasicMaterial color="#7f431d" transparent opacity={0.7} /></mesh>
      {[-1, 1].map((side) => <group key={side} position={[side * 5.85, -1.15, -0.7]}><mesh><sphereGeometry args={[0.5, 24, 24]} /><meshStandardMaterial emissive="#ff6b21" emissiveIntensity={2.1} color="#3f1b0a" /></mesh><pointLight color="#ff6426" intensity={3.4} distance={4} /></group>)}
      <Fighter color="#d82e37" side={-1} phase={phase} />
      <Fighter color="#207ed2" side={1} phase={phase} />
      <Projectile vessel={player} side={-1} phase={phase} />
      <Projectile vessel={rival} side={1} phase={phase} />
      {impact ? <mesh position={[0, 0.65, 0.34]}><sphereGeometry args={[0.34 + (phase === "impact" ? 0.18 : 0), 32, 32]} /><meshBasicMaterial color="#fff2b8" transparent opacity={0.95} /></mesh> : null}
      <Shards active={phase === "result" && loser !== null} color={loser === "player" ? "#e34b4b" : "#58baff"} />
    </>
  );
}

export function BattleArena3D(props: BattleArena3DProps) {
  return <Canvas camera={{ fov: 42, position: [0, 2.1, 12.2] }} dpr={[1, 1.5]} shadows><ArenaScene {...props} /></Canvas>;
}
