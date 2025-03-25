"use client";

import { MenuItem } from "@/app/lib/gameState";
import { animated, useSpring } from "@react-spring/three";
import { Html, Text } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MugParticles } from "./MugParticles";

interface CoffeeMugProps {
  position: [number, number, number];
  menuItem: MenuItem;
  isVariant?: boolean; // Flag to indicate if this mug is showing a variant
}

export const CoffeeMug = ({
  position,
  menuItem,
  isVariant = false,
}: CoffeeMugProps) => {
  const mugRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [originalPosition] = useState<[number, number, number]>([...position]);

  // Spring animation for opacity and scale
  const { opacity, scale } = useSpring({
    opacity: isBreaking ? 0 : 1,
    scale: hovered ? 1.05 : 1,
    config: { tension: 300, friction: 10 },
  });

  const handleShot = (e: ThreeEvent<MouseEvent> | MouseEvent) => {
    // If it's a ThreeEvent, stop propagation
    if ("stopPropagation" in e) {
      e.stopPropagation();
    }

    if (isBreaking) {
      return;
    }

    // Start breaking animation - show particles immediately
    setIsBreaking(true);
    setShowParticles(true);

    // Respawn after a delay
    setTimeout(() => {
      setIsBreaking(false);
      setTimeout(() => {
        setShowParticles(false);
      }, 800);
    }, 800);
  };

  useFrame((state, delta) => {
    if (mugRef.current && !isBreaking && !isVariant) {
      // Keep position stable for regular mugs
      mugRef.current.position.y = originalPosition[1];
    } else if (mugRef.current && !isBreaking && isVariant) {
    }
  });

  // Choose colors based on whether it's a variant or not
  const isBackOption = menuItem.id === "back";
  const bodyColor = isBackOption
    ? hovered
      ? "#991B1B" // Darker red on hover
      : "#EF4444" // Red for back button
    : isVariant
    ? hovered
      ? "#D97706"
      : "#F59E0B" // Amber for variants
    : hovered
    ? "#DDDDDD"
    : "#FFFFFF"; // Blue for regular products

  // Plaque colors
  const plaqueColor = isBackOption
    ? "#7F1D1D" // Dark red for back
    : isVariant
    ? "#92400E" // Brown for variants
    : "#1E3A8A"; // Dark blue for products

  const plaqueTextColor = hovered ? "#FFFF00" : "#FFFFFF"; // Yellow on hover, white otherwise

  // Add a hidden HTML element that can be used for DOM-based click events
  useEffect(() => {
    // Need to properly type the custom event
    const handleDomClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string }>;
      const { id } = customEvent.detail;
      if (id === menuItem.id) {
        if (!isBreaking) {
          handleShot(new MouseEvent("click"));
        }
      }
    };

    // Clean up any existing elements
    window.addEventListener("mug-shot", handleDomClick as EventListener);

    return () => {
      window.removeEventListener("mug-shot", handleDomClick as EventListener);
    };
  }, [menuItem.id, menuItem.name, isBreaking]);

  return (
    <>
      {showParticles && !isBackOption && (
        <MugParticles
          position={originalPosition}
          onComplete={() => {
            setShowParticles(false);
          }}
        />
      )}
      <animated.group
        ref={mugRef}
        position={originalPosition}
        onClick={handleShot}
        userData={{ menuItemId: menuItem.id }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={scale}
      >
        {/* Add hidden Html element with data attribute for DOM selection */}
        <Html>
          <div data-mug-id={menuItem.id} style={{ display: "none" }} />
        </Html>

        {/* Stand - always visible */}
        <group position={[0, -1.5, 0]}>
          {/* Top of stand */}
          <mesh position={[0, -0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshStandardMaterial
              color={
                isBackOption ? "#7F1D1D" : isVariant ? "#92400E" : "#8B4513"
              }
              roughness={0.8}
            />
          </mesh>

          {/* Leg */}
          <mesh position={[0, -0.7, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.15, 1, 8]} />
            <meshStandardMaterial
              color={
                isBackOption ? "#7F1D1D" : isVariant ? "#92400E" : "#8B4513"
              }
              roughness={0.8}
            />
          </mesh>

          {/* Base */}
          <mesh position={[0, -1.2, 0]} receiveShadow>
            <cylinderGeometry args={[0.4, 0.5, 0.1, 8]} />
            <meshStandardMaterial
              color={
                isBackOption ? "#7F1D1D" : isVariant ? "#92400E" : "#8B4513"
              }
              roughness={0.8}
            />
          </mesh>

          {/* Plaque in front of the stand */}
          <group
            position={[0, -0.5, 0.7]}
            rotation={[Math.PI * 0.1, 0, 0]}
            scale={1.5}
          >
            {/* Plaque base */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 0.7, 0.08]} />
              <meshStandardMaterial
                color={plaqueColor}
                metalness={0.3}
                roughness={0.7}
              />
            </mesh>

            {/* Plaque border */}
            <mesh position={[0, 0, 0.02]}>
              <boxGeometry args={[1.4, 0.6, 0.02]} />
              <meshStandardMaterial
                color={"#D4AF37"} // Gold color for the border
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Plaque inner area */}
            <mesh position={[0, 0, 0.04]}>
              <boxGeometry args={[1.3, 0.5, 0.02]} />
              <meshStandardMaterial
                color={"#121212"} // Dark background for text
                metalness={0.1}
                roughness={0.9}
              />
            </mesh>

            {/* Gold screws in corners for decoration */}
            {[
              [-0.6, 0.2, 0.04] as [number, number, number],
              [0.6, 0.2, 0.04] as [number, number, number],
              [-0.6, -0.2, 0.04] as [number, number, number],
              [0.6, -0.2, 0.04] as [number, number, number],
            ].map((pos, index) => (
              <mesh key={index} position={pos}>
                <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
                <meshStandardMaterial
                  color={"#FFD700"}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
            ))}

            {/* Product or brand name */}
            {isBackOption && (
              <Text
                position={[0, 0.12, 0.06]}
                fontSize={0.08}
                maxWidth={1.1}
                textAlign="center"
                color={plaqueTextColor}
                anchorX="center"
                anchorY="middle"
                fontWeight={700}
              >
                ← Back
              </Text>
            )}

            {/* Item name */}
            <Text
              position={[0, isBackOption ? -0.05 : 0.05, 0.06]}
              fontSize={0.08}
              maxWidth={1.5}
              textAlign="center"
              color={plaqueTextColor}
              anchorX="center"
              anchorY="middle"
              fontWeight={500}
            >
              {menuItem.name}
            </Text>

            {/* Price - only show for non-back options with price */}
            {!isBackOption && menuItem.price > 0 && (
              <Text
                position={[0, -0.1, 0.06]}
                fontSize={0.09}
                maxWidth={1.1}
                textAlign="center"
                color={hovered ? "#FFFF00" : "#00FF00"} // Make price stand out in green
                anchorX="center"
                anchorY="middle"
                fontWeight={700}
              >
                ${menuItem.price.toFixed(2)}
              </Text>
            )}
          </group>
        </group>

        <group visible={!isBreaking} position={[0, -1.2, 0]}>
          {/* Mug body */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.4, 0.3, 0.8, 32]} />
            <animated.meshStandardMaterial
              color={bodyColor}
              metalness={0.1}
              roughness={0.2}
              transparent
              opacity={opacity}
            />
          </mesh>

          {/* Mug handle - single torus partially inside the cup */}
          <mesh position={[0.35, 0, 0]} rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.25, 0.05]} />
            <animated.meshStandardMaterial
              color={bodyColor}
              metalness={0.1}
              roughness={0.2}
              transparent
              opacity={opacity}
            />
          </mesh>
        </group>
      </animated.group>
    </>
  );
};
