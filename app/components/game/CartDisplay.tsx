"use client";

import { useMutate } from "@danstackme/apity";
import React, { useEffect, useState } from "react";
import { CheckoutForm } from "../checkout/CheckoutForm";
import { AddressSchema, CardSchema } from "../../../endpoints";
import { z } from "zod";

// Interface for cart items
export interface CartItem {
  id: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  isSubscription?: boolean;
}

// Use Zod infer types
type Address = z.infer<typeof AddressSchema>;
type Card = z.infer<typeof CardSchema>;

interface CartDisplayProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  lastAdded: string | null;
  setLastAdded: React.Dispatch<React.SetStateAction<string | null>>;
  addresses: Address[];
  cards: Card[];
  refetchCards: () => void;
}

export const CartDisplay = ({
  cart,
  setCart,
  lastAdded,
  setLastAdded,
  addresses = [],
  cards = [],
  refetchCards,
}: CartDisplayProps) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  // Calculate total price of cart
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Separate cart items into one-time purchases and subscriptions
  const oneTimeItems = cart.filter((item) => !item.isSubscription);
  const subscriptionItems = cart.filter((item) => item.isSubscription);

  const { mutateAsync: createSubscription } = useMutate({
    path: "/subscription",
    method: "POST",
  });

  const { mutateAsync: createOrder } = useMutate({
    path: "/order",
    method: "POST",
  });

  // Effect to clear lastAdded notification after it fades
  useEffect(() => {
    if (lastAdded) {
      const timer = setTimeout(() => {
        setLastAdded(null);
      }, 2000); // Match the fadeOut animation duration
      return () => clearTimeout(timer);
    }
  }, [lastAdded, setLastAdded]);

  // Handle starting the checkout process
  const handleStartCheckout = () => {
    if (cart.length === 0) return;

    // Show the checkout form
    setShowCheckoutForm(true);
  };

  // Handle completion of checkout form
  const handleCheckoutFormComplete = async (
    addressId: string,
    cardId: string
  ) => {
    setSelectedAddressId(addressId);
    setSelectedCardId(cardId);
    setShowCheckoutForm(false);

    // Now proceed with the checkout
    setIsCheckingOut(true);
    setCheckoutStatus("processing");
    setCheckoutMessage("Processing your order...");

    try {
      // Process one-time purchases if present
      if (oneTimeItems.length > 0) {
        // Prepare one-time items for order API
        const orderVariants: Record<string, number> = {};
        oneTimeItems.forEach((item) => {
          orderVariants[item.id] = item.quantity;
        });

        // Create order using the correct API structure
        await createOrder({
          variants: orderVariants,
          cardID: cardId,
          addressID: addressId,
        });
      }

      // Process subscription items if present
      for (const item of subscriptionItems) {
        // Create subscription using the correct API structure
        await createSubscription({
          productVariantID: item.id,
          quantity: 1, // Subscriptions always have quantity 1
          cardID: cardId,
          addressID: addressId,
          schedule: {
            type: "weekly",
            interval: 2, // Every 2 weeks
          },
        });
      }

      // Order processed successfully
      setCheckoutStatus("success");
      setCheckoutMessage("Your order has been placed successfully!");

      // Clear the cart after successful checkout
      setTimeout(() => {
        setCart([]);
        setIsCheckingOut(false);
        setCheckoutStatus("idle");
        setCheckoutMessage("");
      }, 3000);
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutStatus("error");
      setCheckoutMessage(
        "There was an error processing your order. Please try again."
      );

      setTimeout(() => {
        setIsCheckingOut(false);
        setCheckoutStatus("idle");
        setCheckoutMessage("");
      }, 3000);
    }
  };

  // Handle mouse events to pause shooting when interacting with cart
  const handleCartMouseEnter = () => {
    if (typeof window !== "undefined" && (window as any).setShootingPaused) {
      (window as any).setShootingPaused(true);
    }
  };

  const handleCartMouseLeave = () => {
    if (typeof window !== "undefined" && (window as any).setShootingPaused) {
      (window as any).setShootingPaused(false);
    }
  };

  return (
    <div
      className="fixed top-0 left-0 z-50 font-mono pointer-events-auto cursor-auto"
      onMouseEnter={handleCartMouseEnter}
      onMouseLeave={handleCartMouseLeave}
    >
      {/* Cart Display */}
      <div className="text-[#0f0] bg-black/85 p-4 rounded-md border border-[#0f0] w-[300px] max-h-[calc(100vh-40px)] overflow-y-auto shadow-[0_0_10px_rgba(0,255,0,0.5)] mt-5 ml-5">
        <div className="text-lg font-bold mb-2.5 flex justify-between items-center">
          <span>&gt; YOUR ORDER:</span>
          {cart.length > 0 && !isCheckingOut && !showCheckoutForm && (
            <button
              onClick={() => {
                setCart([]);
                setLastAdded("Cleared all items");
              }}
              className="bg-transparent border border-[#0f0] text-[#0f0] px-2 py-0.5 text-sm rounded cursor-pointer font-mono hover:bg-[rgba(0,255,0,0.2)]"
            >
              CLEAR
            </button>
          )}
        </div>

        {cart.length === 0 && checkoutStatus !== "success" ? (
          <div className="opacity-70">
            &gt; No items selected. Shoot a coffee variant to add it to your
            order...
            <span className="cursor-blink">_</span>
          </div>
        ) : checkoutStatus === "processing" ? (
          <div className="text-[#ffcc00] my-4">
            &gt; {checkoutMessage}
            <span className="cursor-blink">_</span>
          </div>
        ) : checkoutStatus === "success" ? (
          <div className="text-[#00ff00] my-4">
            &gt; {checkoutMessage}
            <span className="cursor-blink">_</span>
          </div>
        ) : checkoutStatus === "error" ? (
          <div className="text-[#ff0000] my-4">
            &gt; {checkoutMessage}
            <span className="cursor-blink">_</span>
          </div>
        ) : (
          <>
            {oneTimeItems.length > 0 && (
              <div className="mb-2">
                <div className="text-sm opacity-80 mb-1">
                  &gt; ONE-TIME PURCHASE:
                </div>
                {oneTimeItems.map((item, index) => (
                  <div key={`onetime-${index}`} className="mb-1.5">
                    &gt; {item.quantity}x {item.productName}: {item.variantName}{" "}
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {subscriptionItems.length > 0 && (
              <div className="mb-2">
                <div className="text-sm opacity-80 mb-1 text-[#0ff]">
                  &gt; SUBSCRIPTION:
                </div>
                {subscriptionItems.map((item, index) => (
                  <div key={`sub-${index}`} className="mb-1.5 text-[#0ff]">
                    &gt; {item.productName}: {item.variantName}{" "}
                    <span>${item.price.toFixed(2)}/delivery</span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[#0f0] mt-2.5 pt-1.5 font-bold">
              &gt; TOTAL: ${cartTotal.toFixed(2)}
              <span className="cursor-blink">_</span>
            </div>

            <div className="mt-3 flex justify-between gap-2">
              <button
                onClick={handleStartCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className={`flex-1 bg-transparent border border-[#0f0] text-[#0f0] px-2 py-1 text-sm rounded cursor-pointer font-mono ${
                  isCheckingOut || cart.length === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[rgba(0,255,0,0.2)]"
                }`}
              >
                {isCheckingOut ? "PROCESSING..." : "CHECKOUT"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Form Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 pointer-events-auto">
          <CheckoutForm
            addresses={addresses}
            cards={cards}
            refetchCards={async () => {
              // Trigger a refetch of the cards data
              try {
                const cardsResponse = await fetch("/card", {
                  headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TERMINAL_BEARER_TOKEN}`,
                    "Content-Type": "application/json",
                  },
                });
                if (cardsResponse.ok) {
                  // This should trigger a re-render with new cards data
                  console.log("Cards refreshed successfully");
                }
              } catch (error) {
                console.error("Error refreshing cards:", error);
              }
            }}
            onComplete={handleCheckoutFormComplete}
            onCancel={() => setShowCheckoutForm(false)}
          />
        </div>
      )}

      {/* Notification when item is added */}
      {lastAdded && (
        <div
          className="text-[#0f0] bg-black/85 px-4 py-2 rounded-md font-bold fixed left-5 animate-fadeOut"
          style={{ top: "calc(320px + 40px)" }}
        >
          &gt; Added to order: {lastAdded}
        </div>
      )}

      <style jsx>{`
        .cursor-blink {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
        .animate-fadeOut {
          animation: fadeOut 2s forwards;
        }
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
