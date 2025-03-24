"use client";

import { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { MenuItem } from "@/app/lib/gameState";
import { CoffeeMug } from "./CoffeeMug";

// Placeholder data for development
const PLACEHOLDER_MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Espresso", price: 3.99 },
  { id: "2", name: "Latte", price: 4.99 },
  { id: "3", name: "Cappuccino", price: 4.49 },
  { id: "4", name: "Mocha", price: 5.49 },
  { id: "5", name: "Americano", price: 3.49 },
];

export const ShootingRange = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    PLACEHOLDER_MENU_ITEMS
  );
  const [debug, setDebug] = useState(false);
  const [lastHit, setLastHit] = useState<string | null>(null);
  const [shotsFired, setShotsFired] = useState(0);
  const [score, setScore] = useState(0);

  const mousePosition = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const sceneRef = useRef<THREE.Group>(null);

  const { camera } = useThree();

  // Add keyboard shortcut to toggle debug mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d") {
        setDebug((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Handle window clicks for shooting
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      setShotsFired((prev) => prev + 1);

      // Update mouse position
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Set up raycaster
      raycaster.current.setFromCamera(mousePosition.current, camera);

      if (sceneRef.current) {
        // Check for intersections
        const intersects = raycaster.current.intersectObjects(
          sceneRef.current.children,
          true
        );

        if (debug)
          console.log("Click detected, intersections:", intersects.length);

        if (intersects.length > 0) {
          // Find the mug group with userData
          let currentObject = intersects[0].object;
          let mugIndex = -1;
          let menuItemId: string | null = null;

          // Traverse up to find parent with userData.menuItemId
          while (currentObject && mugIndex === -1) {
            if (currentObject.userData && currentObject.userData.menuItemId) {
              menuItemId = currentObject.userData.menuItemId as string;
              if (debug) console.log("Found mug with ID:", menuItemId);

              // Find which mug was hit by looking up its ID
              mugIndex = menuItems.findIndex((item) => item.id === menuItemId);

              if (mugIndex !== -1) {
                // Register a hit
                setLastHit(
                  `Hit: ${menuItems[mugIndex].name} ($${menuItems[mugIndex].price})`
                );
                setScore(
                  (prev) => prev + Math.round(menuItems[mugIndex].price * 100)
                );

                // Trigger the mug shot event
                window.dispatchEvent(
                  new CustomEvent("mug-shot", {
                    detail: { id: menuItemId },
                  })
                );
              }
            }

            if (currentObject.parent) {
              currentObject = currentObject.parent;
            } else {
              break;
            }
          }

          if (mugIndex === -1) {
            if (debug) console.log("No mug userData found in intersection");
            setLastHit("Miss!");
          }
        } else {
          setLastHit("Miss!");
        }
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [camera, menuItems, debug]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Regularly check for hovering objects to update cursor
  useFrame(() => {
    raycaster.current.setFromCamera(mousePosition.current, camera);
  });

  return (
    <group ref={sceneRef}>
      {/* Debug overlay */}
      {debug && (
        <Html position={[0, 5, 0]}>
          <div
            style={{
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: "10px",
            }}
          >
            <div>
              Mouse: {mousePosition.current.x.toFixed(2)},{" "}
              {mousePosition.current.y.toFixed(2)}
            </div>
            <div>Shots fired: {shotsFired}</div>
            <div>Score: {score}</div>
            <div>{lastHit || "No hit yet"}</div>
            <button
              onClick={() => setDebug(false)}
              style={{
                backgroundColor: "#333",
                color: "white",
                border: "1px solid white",
                padding: "5px",
                marginTop: "5px",
              }}
            >
              Hide Debug
            </button>
          </div>
        </Html>
      )}

      {/* Score display */}
      <Html position={[0, 8, 0]}>
        <div
          style={{
            color: "white",
            backgroundColor: "rgba(0,0,0,0.3)",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "18px",
            width: "200px",
            transform: "translateX(-50%)",
          }}
        >
          <div>Score: {score}</div>
          <div>Shots: {shotsFired}</div>
        </div>
      </Html>

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1F2937" />
      </mesh>

      {/* Background elements */}
      <mesh position={[0, 5, -15]} receiveShadow>
        <boxGeometry args={[30, 20, 1]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Coffee mugs */}
      <group position={[0, 0, -10]}>
        {menuItems.map((item, index) => (
          <CoffeeMug
            key={item.id}
            position={[(index - (menuItems.length - 1) / 2) * 3, 2, 0]}
            menuItem={item}
          />
        ))}
      </group>
    </group>
  );
};
