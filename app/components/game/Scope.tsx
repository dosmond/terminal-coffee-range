"use client";

import { useEffect, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

interface ScopeProps {
  onExit?: () => void;
}

export const Scope = ({ onExit }: ScopeProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const scopeSize = 600; // Scope size in pixels
  const [isRecoiling, setIsRecoiling] = useState(false);

  // Recoil animation with reversed direction (negative Y value)
  const recoilSpring = useSpring({
    y: isRecoiling ? -50 : 0,
    config: { tension: 500, friction: 15 },
    immediate: false,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleShoot = () => {
      setIsRecoiling(true);
      // Reset recoil after animation
      setTimeout(() => setIsRecoiling(false), 150);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onExit) {
        onExit();
      }
    };

    // Hide cursor when component mounts
    document.body.style.cursor = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleShoot);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      // Restore cursor when component unmounts
      document.body.style.cursor = "auto";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleShoot);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onExit]);

  // Create styled animated divs to avoid TypeScript errors
  const AnimatedMask = animated("div");
  const AnimatedScope = animated("div");

  return (
    <>
      {/* Dark overlay with circular cutout */}
      <AnimatedMask
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          maskImage: recoilSpring.y.to(
            (y) =>
              `radial-gradient(circle ${scopeSize / 2}px at ${position.x}px ${
                position.y + y
              }px, transparent 100%, black 100%)`
          ),
          WebkitMaskImage: recoilSpring.y.to(
            (y) =>
              `radial-gradient(circle ${scopeSize / 2}px at ${position.x}px ${
                position.y + y
              }px, transparent 100%, black 100%)`
          ),
          pointerEvents: "none",
          zIndex: 40,
        }}
      />

      {/* Scope */}
      <AnimatedScope
        style={{
          position: "fixed",
          transform: recoilSpring.y.to((y) => `translateY(${y}px)`),
          left: position.x - scopeSize / 2,
          top: position.y - scopeSize / 2,
          width: scopeSize,
          height: scopeSize,
          pointerEvents: "none",
          zIndex: 40,
        }}
      >
        <div className="relative w-full h-full">
          {/* Crosshair */}
          <div className="absolute left-1/2 top-0 w-[4px] h-full bg-red-500 transform -translate-x-1/2 opacity-75" />
          <div className="absolute left-0 top-1/2 w-full h-[4px] bg-red-500 transform -translate-y-1/2 opacity-75" />

          {/* Circular scope border */}
          <div className="absolute inset-0 border-8 border-black rounded-full" />
          <div className="absolute inset-12 border-4 border-black rounded-full" />

          {/* Range markers */}
          <div className="absolute left-1/2 top-[10%] w-[60px] h-[6px] bg-black transform -translate-x-1/2" />
          <div className="absolute left-1/2 bottom-[10%] w-[60px] h-[6px] bg-black transform -translate-x-1/2" />
          <div className="absolute left-[10%] top-1/2 w-[6px] h-[60px] bg-black transform -translate-y-1/2" />
          <div className="absolute right-[10%] top-1/2 w-[6px] h-[60px] bg-black transform -translate-y-1/2" />
        </div>
      </AnimatedScope>
    </>
  );
};
