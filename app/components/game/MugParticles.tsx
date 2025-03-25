"use client";

import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MugParticlesProps {
  position: [number, number, number];
  onComplete?: () => void;
}

export const MugParticles = ({ position, onComplete }: MugParticlesProps) => {
  const particlesRef = useRef<THREE.Group>(null);
  const [particles, setParticles] = useState<
    {
      position: THREE.Vector3;
      velocity: THREE.Vector3;
      size: number;
      color: string;
    }[]
  >([]);

  // Initialize particles
  useEffect(() => {
    const newParticles = [];
    // More vibrant, visible colors
    const colors = ["#3B82F6", "#2563EB", "#1D4ED8", "#60A5FA", "#93C5FD"];

    // Create 80 particles with random properties for more dramatic effect
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 4; // Higher speed

      newParticles.push({
        position: new THREE.Vector3(
          position[0] + (Math.random() - 0.5) * 0.2, // Add slight initial offset
          position[1] + (Math.random() - 0.5) * 0.2,
          position[2] + (Math.random() - 0.5) * 0.2
        ),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed * Math.random(),
          Math.random() * speed * 1.5, // More upward velocity
          Math.sin(angle) * speed * Math.random()
        ),
        size: Math.random() * 0.15 + 0.08, // Larger sizes
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    setParticles(newParticles);

    // Clean up after animation completes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 1500); // Longer animation time

    return () => clearTimeout(timer);
  }, [position, onComplete]);

  useFrame((state, delta) => {
    // Animate particles
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        if (particlesRef.current && particlesRef.current.children[i]) {
          // Apply gravity
          particle.velocity.y -= 12 * delta; // Stronger gravity

          // Update position
          particle.position.x += particle.velocity.x * delta;
          particle.position.y += particle.velocity.y * delta;
          particle.position.z += particle.velocity.z * delta;

          // Update mesh position
          particlesRef.current.children[i].position.copy(particle.position);

          // Scale down over time (slower fade)
          particlesRef.current.children[i].scale.multiplyScalar(0.985);
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position.toArray()} castShadow>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial
            color={particle.color}
            emissive={particle.color}
            emissiveIntensity={0.7} // Brighter glow
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};
