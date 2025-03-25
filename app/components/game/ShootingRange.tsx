"use client";

import { MenuItem } from "@/app/lib/gameState";
import { ProductSchema } from "@/endpoints";
import { useFetch } from "@danstackme/apity";
import { Cloud, Html, Sky } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { z } from "zod";
import { CartItem } from "./CartDisplay";
import { CoffeeMug } from "./CoffeeMug";

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
  onBannerStateChange?: (state: {
    gameMode: "products" | "variants" | "quantity";
    selectedProduct?: {
      name: string;
      subscription?: "required";
    };
    selectedVariant?: {
      name: string;
    };
    menuItemsLength: number;
    isMobile: boolean;
    isCartActive: boolean;
  }) => void;
}

const quantityOptions: MenuItem[] = [
  { id: "back", name: "Go Back", price: 0 },
  { id: "quantity_-1", name: "Remove 1", price: 0 },
  { id: "quantity_1", name: "Add 1", price: 0 },
];

export const ShootingRange = ({
  cart,
  setCart,
  lastAdded,
  setLastAdded,
  onBannerStateChange,
}: ShootingRangeProps) => {
  const [gameMode, setGameMode] = useState<
    "products" | "variants" | "quantity"
  >("products");
  const [selectedProduct, setSelectedProduct] = useState<z.infer<
    typeof ProductSchema
  > | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  const [showControls, setShowControls] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isCartActive, setIsCartActive] = useState(false);

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
      }
    }
  }, [coffeeList, gameMode]);

  // Update menuItems when switching to variant mode
  useEffect(() => {
    if (gameMode === "variants" && selectedProduct) {
      // Map variants to menu items
      const variantItems: MenuItem[] = [
        { id: "back", name: "Go Back", price: 0 },
        ...selectedProduct.variants.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price / 100, // Convert cents to dollars
        })),
      ];

      setMenuItems(variantItems);
    } else if (gameMode === "quantity" && selectedVariant) {
      // Set the quantity options
      setMenuItems(quantityOptions);
    }
  }, [gameMode, selectedProduct, selectedVariant, quantityOptions]);

  // Handle window clicks for shooting
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Skip shooting functionality if cart is active
      if (isCartActive) return;

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
                  }
                } else if (gameMode === "variants") {
                  // In variant mode - register a hit on a variant
                  const hitVariant = menuItems[mugIndex];

                  // Check if the "Go Back" option was selected
                  if (hitVariant.id === "back") {
                    // Go back to product selection
                    setGameMode("products");
                    setSelectedProduct(null);
                    return;
                  }

                  // Store selected variant
                  setSelectedVariant(hitVariant);

                  // Check if the selected product is a subscription product
                  const isSubscription =
                    selectedProduct?.subscription === "required";

                  if (isSubscription) {
                    // For subscription products, skip quantity selection and add directly to cart
                    const subscriptionItem: CartItem = {
                      id: hitVariant.id,
                      productName: selectedProduct?.name || "",
                      variantName: hitVariant.name,
                      price: hitVariant.price,
                      quantity: 1,
                      isSubscription: true,
                    };

                    // Check if this subscription is already in the cart
                    const existingSubscriptionIndex = cart.findIndex(
                      (item) => item.id === hitVariant.id && item.isSubscription
                    );

                    if (existingSubscriptionIndex >= 0) {
                      // If already exists, no change (subscriptions can only have quantity 1)
                      setLastAdded(
                        `Subscription already added: ${selectedProduct?.name} - ${hitVariant.name}`
                      );
                    } else {
                      // Add new subscription to cart
                      setCart((prevCart) => [...prevCart, subscriptionItem]);
                      setLastAdded(
                        `Added subscription: ${selectedProduct?.name} - ${hitVariant.name}`
                      );
                    }

                    // Return to product selection after adding subscription
                    setGameMode("products");
                    setSelectedProduct(null);
                    setSelectedVariant(null);

                    // Trigger the mug shot event
                    window.dispatchEvent(
                      new CustomEvent("mug-shot", {
                        detail: { id: menuItemId },
                      })
                    );
                  } else {
                    // For regular products, proceed to quantity selection
                    setGameMode("quantity");
                  }
                } else if (gameMode === "quantity") {
                  // In quantity mode - handle quantity selection
                  const hitOption = menuItems[mugIndex];

                  // Check if the "Go Back" option was selected
                  if (hitOption.id === "back") {
                    // Go back to variant selection
                    setGameMode("variants");
                    setSelectedVariant(null);
                    return;
                  }

                  // Extract quantity value from the option ID
                  const quantityChange = hitOption.id === "quantity_1" ? 1 : -1;

                  if (!selectedVariant) return;

                  // Add to cart with the selected quantity
                  const newItem: CartItem = {
                    id: selectedVariant.id,
                    productName: selectedProduct?.name || "",
                    variantName: selectedVariant.name,
                    price: selectedVariant.price,
                    quantity: 1,
                    isSubscription: false,
                  };

                  // Update cart with the new item
                  setCart((prevCart: CartItem[]) => {
                    // Check if this variant is already in the cart
                    const existingItemIndex = prevCart.findIndex(
                      (item: CartItem) =>
                        item.id === selectedVariant.id && !item.isSubscription
                    );

                    if (existingItemIndex >= 0) {
                      // Update quantity of existing item
                      const updatedCart = [...prevCart];
                      const newQuantity =
                        updatedCart[existingItemIndex].quantity +
                        quantityChange;

                      // Don't allow quantity to go below 0
                      if (newQuantity <= 0) {
                        // Remove the item if quantity would be 0 or less
                        return prevCart.filter(
                          (_, index) => index !== existingItemIndex
                        );
                      }

                      updatedCart[existingItemIndex].quantity = newQuantity;
                      return updatedCart;
                    } else {
                      // Only add new item if we're adding (not removing)
                      if (quantityChange > 0) {
                        return [...prevCart, newItem];
                      }
                      return prevCart;
                    }
                  });

                  // Set last added item with quantity information
                  const actionText = quantityChange > 0 ? "Added" : "Removed";
                  setLastAdded(
                    `${actionText} ${Math.abs(quantityChange)}x ${
                      selectedProduct?.name
                    } - ${selectedVariant.name}`
                  );

                  // Stay on the quantity selection screen instead of going back to the product selection
                  // Don't reset the selected product or variant

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
        }
      }
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [
    camera,
    menuItems,
    playGunshot,
    gameMode,
    selectedProduct,
    selectedVariant,
    coffeeList,
    setCart,
    setLastAdded,
    quantityOptions,
    mousePosition,
    raycaster,
    cart,
    isCartActive,
  ]);

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
    const spacing = Math.min(baseSpacing, 20 / totalItems);

    if (gameMode === "quantity") {
      if (index === 0) return [0, 0, 0]; // Back button
      if (index === 1) return [-4, 0, 0]; // Remove 1
      if (index === 2) return [1, 0, 0]; // Add 1
    }

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

  // Pass setIsCartActive to the parent component's scope
  useEffect(() => {
    // Make setIsCartActive available on the window object for the CartDisplay component
    (window as any).setShootingPaused = (isPaused: boolean) => {
      setIsCartActive(isPaused);
    };

    return () => {
      // Clean up
      delete (window as any).setShootingPaused;
    };
  }, []);

  // Update banner state whenever relevant values change
  useEffect(() => {
    if (onBannerStateChange) {
      onBannerStateChange({
        gameMode,
        selectedProduct: selectedProduct
          ? {
              name: selectedProduct.name,
              subscription:
                selectedProduct.subscription === "required"
                  ? "required"
                  : undefined,
            }
          : undefined,
        selectedVariant: selectedVariant
          ? {
              name: selectedVariant.name,
            }
          : undefined,
        menuItemsLength: menuItems.length,
        isMobile,
        isCartActive,
      });
    }
  }, [
    gameMode,
    selectedProduct,
    selectedVariant,
    menuItems.length,
    isMobile,
    isCartActive,
    onBannerStateChange,
  ]);

  console.log(menuItems);

  return (
    <group ref={sceneRef}>
      {skyAndClouds}

      {/* Mouse Helper Animation - only show on desktop when cart is not active */}
      {showControls && menuItems.length > 5 && !isMobile && !isCartActive && (
        <MouseHelper />
      )}

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
