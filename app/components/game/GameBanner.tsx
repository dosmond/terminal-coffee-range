import React from "react";

interface GameBannerProps {
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
}

export const GameBanner = ({
  gameMode,
  selectedProduct,
  selectedVariant,
  menuItemsLength,
  isMobile,
  isCartActive,
}: GameBannerProps) => {
  if (isCartActive) return null;

  return (
    <div className="fixed top-0 right-0 p-4 z-50">
      <div
        style={{
          color: "white",
          backgroundColor:
            gameMode === "variants"
              ? "rgba(39, 99, 195, 0.7)"
              : gameMode === "quantity"
              ? "rgba(76, 175, 80, 0.7)"
              : "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "10px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "20px",
          width: "300px",
        }}
      >
        {gameMode === "products"
          ? "SHOOT TO SELECT A COFFEE"
          : gameMode === "variants"
          ? `${selectedProduct?.name}${
              selectedProduct?.subscription === "required"
                ? " (SUBSCRIPTION)"
                : ""
            }: CHOOSE A VARIANT`
          : `${selectedProduct?.name} - ${selectedVariant?.name}: CHOOSE QUANTITY`}
        {menuItemsLength > 5 && (
          <div style={{ fontSize: "16px", marginTop: "5px" }}>
            {isMobile
              ? "Use two fingers to pan and see more options"
              : "Right-click and drag to see more options"}
          </div>
        )}
      </div>
    </div>
  );
};
