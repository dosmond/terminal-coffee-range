"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated, config } from "@react-spring/three";
import { MenuItem } from "@/app/lib/gameState";
import { MugParticles } from "./MugParticles";
import type { ThreeEvent } from "@react-three/fiber";

interface CoffeeMugProps {
  position: [number, number, number];
  menuItem: MenuItem;
}

export const CoffeeMug = ({ position, menuItem }: CoffeeMugProps) => {
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
    if (mugRef.current && !isBreaking) {
      // Add subtle floating animation when not breaking
      mugRef.current.position.y =
        originalPosition[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const bodyColor = hovered ? "#2563EB" : "#3B82F6";

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
      {showParticles && (
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
      >
        {/* Add hidden Html element with data attribute for DOM selection */}
        <Html>
          <div data-mug-id={menuItem.id} style={{ display: "none" }} />
        </Html>

        <group visible={!isBreaking}>
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

          {/* Mug handle */}
          <mesh position={[0.5, 0, 0]} castShadow>
            <torusGeometry args={[0.2, 0.05, 16, 32, Math.PI]} />
            <animated.meshStandardMaterial
              color={bodyColor}
              metalness={0.1}
              roughness={0.2}
              transparent
              opacity={opacity}
            />
          </mesh>

          {/* Terminal.shop logo */}
          <group>
            <Text
              position={[0, 0.2, 0.42]}
              rotation={[0, 0, 0]}
              fontSize={0.15}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              Terminal.shop
            </Text>

            {/* Menu item info */}
            <Text
              position={[0, -1, 0]}
              rotation={[0, 0, 0]}
              fontSize={0.2}
              color="#FFFFFF"
              anchorX="center"
              anchorY="middle"
            >
              {`${menuItem.name}\n$${menuItem.price}`}
            </Text>
          </group>
        </group>
      </group>
    </>
  );
};
