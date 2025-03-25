"use client";

import React from "react";
import { MenuItem } from "@/app/lib/gameState";
import { Cloud, Html, Sky } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { CoffeeMug } from "./CoffeeMug";
import { useFetch } from "@danstackme/apity";
import { useSpring, animated } from "@react-spring/three";
import { CartItem } from "./CartDisplay";

// Placeholder data for development
const PLACEHOLDER_MENU_ITEMS: MenuItem[] = [
  { id: "1", name: "Espresso", price: 3.99 },
  { id: "2", name: "Latte", price: 4.99 },
  { id: "3", name: "Cappuccino", price: 4.49 },
  { id: "4", name: "Mocha", price: 5.49 },
  { id: "5", name: "Americano", price: 3.49 },
];

// Audio system for game sounds
const useAudio = () => {
  const gunshotRef = useRef<HTMLAudioElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Create audio elements
    gunshotRef.current = new Audio("/sounds/gunshot.mp3");

    // Load the audio elements
    const loadAudio = async () => {
      try {
        if (gunshotRef.current) {
          gunshotRef.current.volume = 0.6;
          gunshotRef.current.load();
        }
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load audio", error);
      }
    };

    loadAudio();

    return () => {
      // Clean up audio elements
      if (gunshotRef.current) {
        gunshotRef.current.pause();
        gunshotRef.current = null;
      }
    };
  }, []);

  const playGunshot = () => {
    if (gunshotRef.current) {
      // Reset the audio to the beginning if it's already playing
      gunshotRef.current.currentTime = 0;
      gunshotRef.current
        .play()
        .catch((err) => console.error("Error playing gunshot sound:", err));
    }
  };

  return { playGunshot, isLoaded };
};

// MouseHelper component to show right-click dragging animation
const MouseHelper = () => {
  const [visible, setVisible] = useState(true);

  // Hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <group position={[0, 1, -6]}>
      <Html>
        <div
          style={{
            position: "relative",
            width: "160px",
            height: "100px",
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          {/* CSS mouse cursor */}
          <div
            style={{
              position: "absolute",
              width: "30px",
              height: "45px",
              borderRadius: "12px",
              border: "2px solid white",
              background: "rgba(0,0,0,0.6)",
              animation: "moveLeftRight 2s infinite alternate ease-in-out",
              left: "60px",
              top: "20px",
            }}
          >
            {/* Right mouse button highlight */}
            <div
              style={{
                position: "absolute",
                width: "12px",
                height: "15px",
                borderRadius: "5px",
                background: "rgba(255,255,255,0.6)",
                right: "2px",
                top: "2px",
                animation: "pulse 1s infinite alternate ease-in-out",
              }}
            />

            {/* Scroll wheel */}
            <div
              style={{
                position: "absolute",
                width: "6px",
                height: "10px",
                borderRadius: "3px",
                background: "rgba(255,255,255,0.3)",
                left: "12px",
                top: "5px",
              }}
            />
          </div>

          {/* Cursor movement arrows */}
          <div
            style={{
              position: "absolute",
              left: "30px",
              top: "40px",
              fontSize: "18px",
              color: "white",
              animation: "fadeInOut 2s infinite alternate ease-in-out",
            }}
          >
            ←→
          </div>

          <style jsx>{`
            @keyframes moveLeftRight {
              0% {
                transform: translateX(-20px);
              }
              100% {
                transform: translateX(20px);
              }
            }
            @keyframes pulse {
              0% {
                background: rgba(255, 255, 255, 0.3);
              }
              100% {
                background: rgba(255, 255, 255, 0.9);
              }
            }
            @keyframes fadeInOut {
              0% {
                opacity: 0.4;
              }
              100% {
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </Html>
    </group>
  );
};

interface ShootingRangeProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  lastAdded: string | null;
  setLastAdded: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ShootingRange = ({
  cart,
  setCart,
  lastAdded,
  setLastAdded,
}: ShootingRangeProps) => {
  // Game mode state: 'products' for showing all coffees, 'variants' for showing variants of selected coffee
  const [gameMode, setGameMode] = useState<"products" | "variants">("products");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(
    PLACEHOLDER_MENU_ITEMS
  );
  const [lastHit, setLastHit] = useState<string | null>(null);
  const [shotsFired, setShotsFired] = useState(0);
  const [score, setScore] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const mousePosition = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const sceneRef = useRef<THREE.Group>(null);

  const { camera } = useThree();
  const { playGunshot } = useAudio();

  // Fetch coffee products
  const { data: coffeeList, isLoading } = useFetch({
    path: "/product",
  });

  // Process coffee products when data is loaded
  useEffect(() => {
    if (coffeeList?.data && gameMode === "products") {
      // Map coffee products to menu items
      const productItems: MenuItem[] = coffeeList.data
        .filter(
          (product: any) => product.variants && product.variants.length > 0
        ) // Filter out products without variants
        .map((product: any) => ({
          id: product.id,
          name: product.name,
          price: (product.variants[0]?.price || 0) / 100, // Convert cents to dollars
        }));

      if (productItems.length > 0) {
        setMenuItems(productItems);
      } else {
        // Fallback to placeholder if no valid products
        setMenuItems(PLACEHOLDER_MENU_ITEMS);
      }
    }
  }, [coffeeList, gameMode]);

  // Update menuItems when switching to variant mode
  useEffect(() => {
    if (gameMode === "variants" && selectedProduct) {
      // Map variants to menu items
      const variantItems: MenuItem[] = selectedProduct.variants.map(
        (variant: any) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price / 100, // Convert cents to dollars
        })
      );

      setMenuItems(variantItems);
    }
  }, [gameMode, selectedProduct]);

  // Handle window clicks for shooting
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      setShotsFired((prev) => prev + 1);

      // Play gunshot sound
      playGunshot();

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

        if (intersects.length > 0) {
          // Find the mug group with userData
          let currentObject = intersects[0].object;
          let mugIndex = -1;
          let menuItemId: string | null = null;

          // Traverse up to find parent with userData.menuItemId
          while (currentObject && mugIndex === -1) {
            if (currentObject.userData && currentObject.userData.menuItemId) {
              menuItemId = currentObject.userData.menuItemId as string;

              // Find which mug was hit by looking up its ID
              mugIndex = menuItems.findIndex((item) => item.id === menuItemId);

              if (mugIndex !== -1) {
                // Handle hit based on game mode
                if (gameMode === "products") {
                  // Find the selected product in the coffee list
                  const hitProduct = coffeeList?.data.find(
                    (p: any) => p.id === menuItemId
                  );
                  if (hitProduct) {
                    // Switch to variant mode
                    setSelectedProduct(hitProduct);
                    setGameMode("variants");
                    setLastHit(`Selected: ${hitProduct.name}`);
                  }
                } else {
                  // In variant mode - register a hit on a variant
                  const hitVariant = menuItems[mugIndex];
                  setLastHit(
                    `Hit: ${selectedProduct?.name} - ${
                      hitVariant.name
                    } ($${hitVariant.price.toFixed(2)})`
                  );
                  setScore((prev) => prev + Math.round(hitVariant.price * 100));

                  // Add to cart
                  const newItem: CartItem = {
                    id: hitVariant.id,
                    productName: selectedProduct?.name || "",
                    variantName: hitVariant.name,
                    price: hitVariant.price,
                    quantity: 1,
                  };

                  // Update cart with the new item
                  setCart((prevCart: CartItem[]) => {
                    // Check if this variant is already in the cart
                    const existingItemIndex = prevCart.findIndex(
                      (item: CartItem) => item.id === hitVariant.id
                    );

                    if (existingItemIndex >= 0) {
                      // Increment quantity of existing item
                      const updatedCart = [...prevCart];
                      updatedCart[existingItemIndex].quantity += 1;
                      return updatedCart;
                    } else {
                      // Add new item to cart
                      return [...prevCart, newItem];
                    }
                  });

                  // Set last added item with product and variant name
                  setLastAdded(`${selectedProduct?.name} - ${hitVariant.name}`);

                  // Reset to product selection mode
                  setTimeout(() => {
                    setGameMode("products");
                    setSelectedProduct(null);
                  }, 1500);

                  // Trigger the mug shot event
                  window.dispatchEvent(
                    new CustomEvent("mug-shot", {
                      detail: { id: menuItemId },
                    })
                  );
                }
              }
            }

            if (currentObject.parent) {
              currentObject = currentObject.parent;
            } else {
              break;
            }
          }

          if (mugIndex === -1) {
            setLastHit("Miss!");
          }
        } else {
          setLastHit("Miss!");
        }
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [camera, menuItems, playGunshot, gameMode, selectedProduct, coffeeList]);

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

  // Memoize the clouds and sky to prevent re-rendering on every state change
  const skyAndClouds = useMemo(
    () => (
      <>
        {/* Sky */}
        <Sky
          distance={4500000}
          sunPosition={[1, 0, 0]}
          inclination={0.6}
          azimuth={0.1}
          rayleigh={0.5}
        />

        {/* Clouds */}
        <Cloud position={[-20, 40, -100]} speed={0.2} opacity={0.8} />
        <Cloud position={[20, 30, -100]} speed={0.2} opacity={0.6} />
        <Cloud position={[0, 35, -80]} speed={0.2} opacity={0.7} />
      </>
    ),
    []
  );

  // Calculate spacing for mugs based on count
  const getMugPosition = (
    index: number,
    totalItems: number
  ): [number, number, number] => {
    // Base spacing between mugs
    const baseSpacing = 3;

    // Adjust spacing based on number of items
    const spacing =
      totalItems > 5 ? Math.min(baseSpacing, 20 / totalItems) : baseSpacing;

    // Calculate x position
    const x = (index - (totalItems - 1) / 2) * spacing;

    return [x, 0, 0];
  };

  // Hide controls helper after user has panned
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // If right button is pressed
      if (e.button === 2) {
        setShowControls(false);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <group ref={sceneRef}>
      {skyAndClouds}

      {/* Mouse Helper Animation - only show on desktop */}
      {showControls && menuItems.length > 5 && !isMobile && <MouseHelper />}

      {/* Game mode indicator */}
      <Html position={[0, 10, -10]}>
        <div
          style={{
            color: "white",
            backgroundColor:
              gameMode === "variants"
                ? "rgba(39, 99, 195, 0.7)"
                : "rgba(0, 0, 0, 0.5)",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "20px",
            width: "300px",
            transform: "translateX(-50%)",
          }}
        >
          {gameMode === "products"
            ? "SHOOT TO SELECT A COFFEE"
            : `${selectedProduct?.name}: CHOOSE A VARIANT`}
          {menuItems.length > 5 && (
            <div style={{ fontSize: "16px", marginTop: "5px" }}>
              {isMobile
                ? "Use two fingers to pan and see more options"
                : "Right-click and drag to see more options"}
            </div>
          )}
        </div>
      </Html>

      {/* Ground - only visible when not using webcam */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d5c27" />
      </mesh>
      {/* Coffee mugs with stands */}
      <group position={[0, 2, -10]}>
        {isLoading ? (
          // Loading state
          <Html position={[0, 1, 0]}>
            <div style={{ color: "white", fontSize: "24px" }}>
              Loading coffee products...
            </div>
          </Html>
        ) : (
          // Render mugs based on available menu items
          menuItems.map((item, index) => (
            <CoffeeMug
              key={item.id}
              position={getMugPosition(index, menuItems.length)}
              menuItem={item}
              isVariant={gameMode == "variants"}
            />
          ))
        )}
      </group>

      {/* Add lighting to highlight the stands */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight intensity={0.4} />
    </group>
  );
};
