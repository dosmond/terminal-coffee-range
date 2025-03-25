"use client";

import React from "react";
import {
  CameraShake,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { Scope } from "./Scope";
import { ShootingRange } from "./ShootingRange";
import { WelcomeMenu } from "./WelcomeMenu";
import { CartItem } from "./CartDisplay";

interface GameSceneProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  lastAdded: string | null;
  setLastAdded: React.Dispatch<React.SetStateAction<string | null>>;
}

export const GameScene = ({
  cart,
  setCart,
  lastAdded,
  setLastAdded,
}: GameSceneProps) => {
  const [gameStarted, setGameStarted] = useState(false);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleExitGame = () => {
    setGameStarted(false);
  };

  // Prevent right-click context menu so we can use right-click for panning
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return (
    <div className="w-full h-screen relative">
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 3, 10]} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <ShootingRange
            cart={cart}
            setCart={setCart}
            lastAdded={lastAdded}
            setLastAdded={setLastAdded}
          />
          <CameraShake
            maxYaw={0.01}
            maxPitch={0.01}
            maxRoll={0.01}
            yawFrequency={0.5}
            pitchFrequency={0.5}
            rollFrequency={0.4}
          />
          <OrbitControls
            enablePan={true}
            enableZoom={false}
            enableRotate={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            panSpeed={1.5}
            screenSpacePanning={true}
            mouseButtons={{
              LEFT: undefined,
              MIDDLE: undefined,
              RIGHT: 2, // Only right mouse button for panning
            }}
            touches={{
              ONE: undefined, // Disable rotation
              TWO: 2, // Two fingers for panning
            }}
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
