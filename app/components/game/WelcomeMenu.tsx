"use client";

import { useState, useCallback } from "react";
import { Html } from "@react-three/drei";

interface WelcomeMenuProps {
  onStart: () => void;
}

export const WelcomeMenu = ({ onStart }: WelcomeMenuProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleStart = useCallback(() => {
    onStart();
  }, [onStart]);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white z-50">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Terminal.Shop</h1>
        <h2 className="text-2xl mb-6">Coffee Shooting Range</h2>

        <p className="mb-8 text-gray-300">
          Take aim at the coffee menu! Shoot the mugs to see them break and
          respawn.
        </p>

        <button
          onClick={handleStart}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`px-8 py-3 rounded-full text-xl font-semibold transition-all duration-200 ${
            isHovered
              ? "bg-blue-500 shadow-lg transform scale-105"
              : "bg-blue-600"
          }`}
        >
          Start Shooting
        </button>

        <div className="mt-6 text-sm text-gray-400">
          Click to shoot • Press D for debug • ESC to exit game
        </div>
      </div>
    </div>
  );
};
