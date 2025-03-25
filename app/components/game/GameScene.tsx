"use client";

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

export const GameScene = () => {
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
            enablePan={true}
            enableZoom={false}
            enableRotate={false}
            minPolarAngle={Math.PI / 2} // Lock at 90 degrees (horizontal)
            maxPolarAngle={Math.PI / 2} // L
            // ock at 90 degrees (horizontal)
            // This prevents Y-axis movement during panning
            addEventListener={undefined}
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
