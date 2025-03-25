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

  // Spring animation only for opacity
  const { opacity } = useSpring({
    opacity: isBreaking ? 0 : 1,
    config: { duration: 150 }, // Fast fade out
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
    ? "#2563EB"
    : "#3B82F6"; // Blue for regular products

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
      <group
        ref={mugRef}
        position={originalPosition}
        onClick={handleShot}
        userData={{ menuItemId: menuItem.id }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Add hidden Html element with data attribute for DOM selection */}
        <Html>
          <div data-mug-id={menuItem.id} style={{ display: "none" }} />
        </Html>

        {/* Stand - always visible */}
        <group position={[0, -1.8, 5]}>
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
        </group>

        <group visible={!isBreaking} position={[0, -1.5, 5]}>
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

          {/* Terminal.shop logo or back arrow */}
          <group>
            <Text
              position={[0, 0.2, 0.42]}
              rotation={[0, 0, 0]}
              fontSize={0.15}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              {isBackOption ? "← Back" : "Terminal.shop"}
            </Text>
          </group>

          {/* Menu item info - part of the mug */}
          <Text
            position={[0.1, -0.2, 0.4]}
            rotation={[0, 0, 0]}
            fontSize={0.12}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
          >
            {`${menuItem.name}`}
            {!isBackOption &&
              menuItem.price > 0 &&
              `\n$${menuItem.price.toFixed(2)}`}
          </Text>
        </group>
      </group>
    </>
  );
};
