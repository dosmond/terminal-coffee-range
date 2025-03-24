"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState } from "react";
import { ShootingRange } from "./ShootingRange";
import { Scope } from "./Scope";
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
          <OrbitControls
            enabled={!gameStarted}
            enablePan={false}
            enableZoom={false}
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
