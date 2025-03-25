"use client";

import React, { useState } from "react";
import { useMutate } from "@danstackme/apity";
import { AddressSchema, CardSchema } from "../../../endpoints";
import { z } from "zod";

// Use the Zod infer types for Address and Card
type Address = z.infer<typeof AddressSchema>;
type Card = z.infer<typeof CardSchema>;

interface CheckoutFormProps {
  addresses: Address[];
  cards: Card[];
  refetchCards: () => void;
  onComplete: (addressId: string, cardId: string) => void;
  onCancel: () => void;
}

export const CheckoutForm = ({
  addresses,
  cards,
  refetchCards,
  onComplete,
  onCancel,
}: CheckoutFormProps) => {
  const [step, setStep] = useState<"selection" | "address" | "card">(
    addresses.length > 0 && cards.length > 0
      ? "selection"
      : addresses.length === 0
      ? "address"
      : "card"
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.length > 0 ? addresses[0].id : ""
  );
  const [selectedCardId, setSelectedCardId] = useState<string>(
    cards.length > 0 ? cards[0].id : ""
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: "",
    street1: "",
    street2: "",
    city: "",
    province: "",
    country: "US",
    zip: "",
    phone: "",
  });

  // Create new address API call
  const { mutateAsync: createAddress } = useMutate({
    path: "/address",
    method: "POST",
  });

  // Card collection API call
  const { mutateAsync: collectCard } = useMutate({
    path: "/card/collect",
    method: "POST",
  });

  // Create card API call
  const { mutateAsync: createCard } = useMutate({
    path: "/card",
    method: "POST",
  });

  // Handle address form input changes
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  // Handle submission of new address
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await createAddress(newAddress);

      // Update selected address ID with the new address
      if (response && response.data) {
        setSelectedAddressId(response.data);

        // If we also have a card, complete checkout
        if (cards.length > 0 || selectedCardId) {
          onComplete(response.data, selectedCardId);
        } else {
          // Otherwise, move to card step
          setStep("card");
        }
      }
    } catch (error) {
      console.error("Error creating address:", error);
    }
  };

  // Handle card collection and creation
  const handleCardCollection = async () => {
    try {
      // First get a URL for card collection
      const collectResponse = await collectCard(undefined);

      if (collectResponse && collectResponse.data && collectResponse.data.url) {
        // Open card collection URL in a new window/tab
        const cardWindow = window.open(collectResponse.data.url, "_blank");

        if (cardWindow) {
          cardWindow.onload = () => {
            refetchCards();
          };

          cardWindow.onclose = () => {
            refetchCards();
          };
        }

        // This is a simplified flow - in a real app you'd need to handle the token return
        // For this example, we'll just simulate getting a token after the window is closed
        alert(
          "After entering your card information, close the window and click 'Complete Card Entry' below."
        );
      }
    } catch (error) {
      console.error("Error collecting card:", error);
    }
  };

  // Simulate card creation after manual collection
  const handleCardCreation = async () => {
    try {
      // In a real app, you'd get this token from the card collection process
      const mockToken = "tok_visa";

      const response = await createCard({ token: mockToken });

      if (response && response.data) {
        setSelectedCardId(response.data);
        onComplete(selectedAddressId, response.data);
      }
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  // Handle manually refreshing the cards list
  const handleRefreshCards = async () => {
    setIsRefreshing(true);
    refetchCards();

    // Reset the refreshing state after a slight delay for better UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 750);
  };

  const handleSelectionComplete = () => {
    onComplete(selectedAddressId, selectedCardId);
  };

  return (
    <div className="w-full max-w-md bg-black/85 p-6 rounded-md border border-[#0f0] shadow-[0_0_10px_rgba(0,255,0,0.5)] text-[#0f0] font-mono pointer-events-auto cursor-auto">
      <h2 className="text-xl font-bold mb-4">&gt; CHECKOUT</h2>

      {step === "selection" && (
        <div>
          <div className="mb-4">
            <label className="block text-sm mb-2">
              &gt; SELECT SHIPPING ADDRESS:
            </label>
            <select
              className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-pointer"
              value={selectedAddressId}
              onChange={(e) => setSelectedAddressId(e.target.value)}
            >
              {addresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.name} - {address.street1}, {address.city}
                </option>
              ))}
            </select>
            <button
              onClick={() => setStep("address")}
              className="mt-2 bg-transparent border border-[#0f0] text-[#0f0] px-3 py-1 rounded text-sm hover:bg-[rgba(0,255,0,0.2)] cursor-pointer"
            >
              ADD NEW ADDRESS
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm">
                &gt; SELECT PAYMENT METHOD:
              </label>
              <button
                onClick={handleRefreshCards}
                disabled={isRefreshing}
                className={`text-xs px-2 py-0.5 bg-transparent border border-[#0f0] text-[#0f0] rounded hover:bg-[rgba(0,255,0,0.2)] ${
                  isRefreshing
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                {isRefreshing ? "REFRESHING..." : "REFRESH"}
              </button>
            </div>
            <select
              className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-pointer"
              value={selectedCardId}
              onChange={(e) => setSelectedCardId(e.target.value)}
            >
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.brand} **** {card.last4} - Expires{" "}
                  {card.expiration.month}/{card.expiration.year}
                </option>
              ))}
            </select>
            <button
              onClick={() => setStep("card")}
              className="mt-2 bg-transparent border border-[#0f0] text-[#0f0] px-3 py-1 rounded text-sm hover:bg-[rgba(0,255,0,0.2)] cursor-pointer"
            >
              ADD NEW CARD
            </button>
          </div>

          <div className="flex justify-between">
            <button
              onClick={onCancel}
              className="bg-transparent border border-[#ff0000] text-[#ff0000] px-4 py-2 rounded hover:bg-[rgba(255,0,0,0.2)] cursor-pointer"
            >
              CANCEL
            </button>
            <button
              onClick={handleSelectionComplete}
              className="bg-transparent border border-[#0f0] text-[#0f0] px-4 py-2 rounded hover:bg-[rgba(0,255,0,0.2)] cursor-pointer"
            >
              COMPLETE CHECKOUT
            </button>
          </div>
        </div>
      )}

      {step === "address" && (
        <form onSubmit={handleAddressSubmit}>
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm mb-1">&gt; NAME:</label>
              <input
                type="text"
                name="name"
                value={newAddress.name}
                onChange={handleAddressChange}
                className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">&gt; STREET ADDRESS:</label>
              <input
                type="text"
                name="street1"
                value={newAddress.street1}
                onChange={handleAddressChange}
                className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                &gt; APT/SUITE (OPTIONAL):
              </label>
              <input
                type="text"
                name="street2"
                value={newAddress.street2}
                onChange={handleAddressChange}
                className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">&gt; CITY:</label>
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleAddressChange}
                  className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  &gt; STATE/PROVINCE:
                </label>
                <input
                  type="text"
                  name="province"
                  value={newAddress.province}
                  onChange={handleAddressChange}
                  className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">
                  &gt; ZIP/POSTAL CODE:
                </label>
                <input
                  type="text"
                  name="zip"
                  value={newAddress.zip}
                  onChange={handleAddressChange}
                  className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">&gt; COUNTRY:</label>
                <input
                  type="text"
                  name="country"
                  value={newAddress.country}
                  onChange={handleAddressChange}
                  className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
                  maxLength={2}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">
                &gt; PHONE (OPTIONAL):
              </label>
              <input
                type="tel"
                name="phone"
                value={newAddress.phone}
                onChange={handleAddressChange}
                className="w-full bg-black border border-[#0f0] rounded p-2 text-[#0f0] cursor-text"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() =>
                addresses.length > 0 ? setStep("selection") : onCancel()
              }
              className="bg-transparent border border-[#ff0000] text-[#ff0000] px-4 py-2 rounded hover:bg-[rgba(255,0,0,0.2)] cursor-pointer"
            >
              BACK
            </button>
            <button
              type="submit"
              className="bg-transparent border border-[#0f0] text-[#0f0] px-4 py-2 rounded hover:bg-[rgba(0,255,0,0.2)] cursor-pointer"
            >
              SAVE ADDRESS
            </button>
          </div>
        </form>
      )}

      {step === "card" && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p>&gt; Add a new payment method to complete your purchase.</p>
            <button
              onClick={handleRefreshCards}
              disabled={isRefreshing}
              className={`text-xs px-2 py-0.5 bg-transparent border border-[#0f0] text-[#0f0] rounded hover:bg-[rgba(0,255,0,0.2)] ${
                isRefreshing
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {isRefreshing ? "..." : "REFRESH"}
            </button>
          </div>

          {cards.length > 0 && (
            <div className="mb-4 mt-2">
              <div className="text-sm mb-1">&gt; EXISTING CARDS:</div>
              <ul className="text-sm pl-2 space-y-1">
                {cards.map((card) => (
                  <li key={card.id}>
                    &gt; {card.brand} **** {card.last4} - Expires{" "}
                    {card.expiration.month}/{card.expiration.year}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <button
              onClick={handleCardCollection}
              className="w-full bg-transparent border border-[#0f0] text-[#0f0] px-4 py-2 rounded hover:bg-[rgba(0,255,0,0.2)] mb-3 cursor-pointer"
            >
              ENTER CARD DETAILS
            </button>

            <button
              onClick={handleCardCreation}
              className="w-full bg-transparent border border-[#0ff] text-[#0ff] px-4 py-2 rounded hover:bg-[rgba(0,255,255,0.2)] cursor-pointer"
            >
              COMPLETE CARD ENTRY
            </button>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() =>
                cards.length > 0 ? setStep("selection") : onCancel()
              }
              className="bg-transparent border border-[#ff0000] text-[#ff0000] px-4 py-2 rounded hover:bg-[rgba(255,0,0,0.2)] cursor-pointer"
            >
              BACK
            </button>
          </div>
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
      `}</style>
    </div>
  );
};
