"use client";

import React, { useEffect } from "react";

// Interface for cart items
export interface CartItem {
  id: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}

interface CartDisplayProps {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  lastAdded: string | null;
  setLastAdded: React.Dispatch<React.SetStateAction<string | null>>;
}

export const CartDisplay = ({
  cart,
  setCart,
  lastAdded,
  setLastAdded,
}: CartDisplayProps) => {
  // Calculate total price of cart
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Effect to clear lastAdded notification after it fades
  useEffect(() => {
    if (lastAdded) {
      const timer = setTimeout(() => {
        setLastAdded(null);
      }, 2000); // Match the fadeOut animation duration
      return () => clearTimeout(timer);
    }
  }, [lastAdded, setLastAdded]);

  return (
    <div className="fixed top-0 left-0 z-50 font-mono pointer-events-auto">
      {/* Cart Display */}
      <div className="text-[#0f0] bg-black/85 p-4 rounded-md border border-[#0f0] w-[300px] max-h-[calc(100vh-40px)] overflow-y-auto shadow-[0_0_10px_rgba(0,255,0,0.5)] mt-5 ml-5">
        <div className="text-lg font-bold mb-2.5 flex justify-between items-center">
          <span>&gt; YOUR ORDER:</span>
          {cart.length > 0 && (
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

        {cart.length === 0 ? (
          <div className="opacity-70">
            &gt; No items selected. Shoot a coffee variant to add it to your
            order...
            <span className="cursor-blink">_</span>
          </div>
        ) : (
          <>
            {cart.map((item, index) => (
              <div key={index} className="mb-1.5">
                &gt; {item.quantity}x {item.productName}: {item.variantName}{" "}
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-[#0f0] mt-2.5 pt-1.5 font-bold">
              &gt; TOTAL: ${cartTotal.toFixed(2)}
              <span className="cursor-blink">_</span>
            </div>
          </>
        )}
      </div>

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
          font-weight: bold;
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
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .animate-fadeOut {
          animation: fadeOut 2s forwards;
        }
      `}</style>
    </div>
  );
};
