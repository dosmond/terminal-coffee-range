"use client";

import {
  CameraShake,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { Scope } from "./Scope";
import { ShootingRange } from "./ShootingRange";
import { WelcomeMenu } from "./WelcomeMenu";

export const GameScene = () => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleExitGame = () => {
    setGameStarted(false);
  };

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 2, 8]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <ShootingRange />
          {/* <Environment
            files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/lilienstein_2k.hdr"
            ground={{ height: 4, radius: 50, scale: 20 }}
          /> */}
          <CameraShake
            maxYaw={0.01}
            maxPitch={0.01}
            maxRoll={0.01}
            yawFrequency={0.5}
            pitchFrequency={0.5}
            rollFrequency={0.4}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>

      {gameStarted ? (
        <Scope onExit={handleExitGame} />
      ) : (
        <WelcomeMenu onStart={handleStartGame} />
      )}
    </div>
  );
};
