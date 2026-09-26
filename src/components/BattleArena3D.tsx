"use client";
import { Image as VesselImage } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { Vessel } from "@/types/vessel";

export type FlyingVessel = { id: number; owner: "player" | "rival"; progress: number; vessel: Vessel; z: number };
type Props = { aiZ: number; hit: "player" | "rival" | null; player: Vessel | null; playerZ: number; projectiles: FlyingVessel[]; rival: Vessel | null; shake: number; winner: "player" | "rival" | null };

function Fighter({ color, side, z, throwing, defeated }: { color: string; side: -1 | 1; z: number; throwing: boolean; defeated: boolean }) {
  const root = useRef<Group>(null); const arm = useRef<Group>(null);
  useFrame(({ clock }) => { if (root.current) root.current.position.z = z; if (arm.current) arm.current.rotation.z = throwing ? side * -1.2 : side * (0.05 * Math.sin(clock.getElapsedTime() * 2)); });
  return <group ref={root} position={[side * 4.45, -1.22, z]} rotation={[0, side * 0.42, defeated ? side * 1.15 : 0]}>
    <mesh castShadow position={[0, 1.63, 0]}><sphereGeometry args={[.42, 28, 28]}/><meshStandardMaterial color={color} roughness={.28}/></mesh>
    <mesh castShadow position={[0,.72,0]}><capsuleGeometry args={[.42,1.15,8,20]}/><meshStandardMaterial color={color} roughness={.3}/></mesh>
    <mesh castShadow position={[-.22,-.2,0]}><capsuleGeometry args={[.16,.78,6,16]}/><meshStandardMaterial color={color}/></mesh><mesh castShadow position={[.22,-.2,0]}><capsuleGeometry args={[.16,.78,6,16]}/><meshStandardMaterial color={color}/></mesh>
    <group ref={arm} position={[side * -.45,1.05,0]}><mesh castShadow position={[side * -.2,-.42,0]}><capsuleGeometry args={[.14,.82,6,16]}/><meshStandardMaterial color={color}/></mesh></group>
    <mesh castShadow position={[side*.45,.58,0]} rotation={[0,0,side*.2]}><capsuleGeometry args={[.14,.86,6,16]}/><meshStandardMaterial color={color}/></mesh>
  </group>;
}
function Projectile({ shot }: { shot: FlyingVessel }) { const x = shot.owner === "player" ? -4.05 + shot.progress * 8.1 : 4.05 - shot.progress * 8.1; const y = -.1 + Math.sin(shot.progress*Math.PI)*1.55; return <group position={[x,y,shot.z]} rotation={[0,0,(shot.owner === "player" ? 1 : -1)*shot.progress*10]}><VesselImage url={shot.vessel.imageUrl} transparent opacity={.98} scale={[1.1,1.1]}/><mesh position={[0,0,-.07]}><circleGeometry args={[.58,30]}/><meshBasicMaterial color={shot.owner === "player" ? "#ef4848" : "#55afff"} transparent opacity={.42}/></mesh></group>; }
function Sparks({ active, color }: { active:boolean;color:string }) { const pieces=useMemo(()=>Array.from({length:36},(_,i)=>({a:i*.74,r:.15+(i%7)*.13,y:((i%6)-3)*.13})),[]); if(!active)return null; return <group position={[0,.45,0]}>{pieces.map((p,i)=><mesh key={i} position={[Math.cos(p.a)*p.r,p.y,Math.sin(p.a)*p.r]}><sphereGeometry args={[.035+(i%3)*.018,8,8]}/><meshBasicMaterial color={color}/></mesh>)}</group>; }
function Scene({ aiZ, hit, playerZ, projectiles, shake, winner }: Props) { const cameraRig=useRef<Group>(null); useFrame(({clock})=>{if(cameraRig.current){const s=shake>0?.09:0;cameraRig.current.position.x=Math.sin(clock.getElapsedTime()*48)*s;cameraRig.current.position.y=Math.cos(clock.getElapsedTime()*55)*s;}}); const pThrow=projectiles.some(s=>s.owner==="player"), rThrow=projectiles.some(s=>s.owner==="rival"); return <group ref={cameraRig}>
  <ambientLight intensity={.5}/><directionalLight castShadow color="#ffbd6f" intensity={2.8} position={[1,7,5]}/><pointLight color="#ff5d25" intensity={hit?10:1.2} distance={8} position={[0,.8,1]}/>
  <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-1.7,0]}><circleGeometry args={[6.7,80]}/><meshStandardMaterial color="#25130c" roughness={.5} metalness={.5}/></mesh><mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.68,0]}><ringGeometry args={[3.5,3.59,80]}/><meshBasicMaterial color="#df9131" transparent opacity={.9}/></mesh>
  {[-1,1].map(side=><group key={side} position={[side*5.8,-1.05,0]}><mesh><sphereGeometry args={[.48,24,24]}/><meshStandardMaterial color="#3a1608" emissive="#ff6420" emissiveIntensity={2.4}/></mesh><pointLight color="#ff6420" intensity={3} distance={4}/></group>)}
  <Fighter color="#d92e39" side={-1} z={playerZ} throwing={pThrow} defeated={winner==="rival"}/><Fighter color="#2588da" side={1} z={aiZ} throwing={rThrow} defeated={winner==="player"}/>{projectiles.map(shot=><Projectile key={shot.id} shot={shot}/>) }<Sparks active={Boolean(hit)} color={hit==="player"?"#ff6868":"#78c5ff"}/>
 </group>; }
export function BattleArena3D(props:Props){return <Canvas shadows dpr={[1,1.5]} camera={{fov:42,position:[0,2.25,12.4]}}><Scene {...props}/></Canvas>;}
