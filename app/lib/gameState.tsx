"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface GameState {
  selectedItem: MenuItem | null;
  menuItems: MenuItem[];
  score: number;
}

interface GameStateContextType extends GameState {
  selectItem: (item: MenuItem) => void;
  fetchMenuItems: () => Promise<void>;
}

const GameStateContext = createContext<GameStateContextType | undefined>(
  undefined
);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>({
    selectedItem: null,
    menuItems: [],
    score: 0,
  });

  const selectItem = (item: MenuItem) => {
    setState((prev) => ({ ...prev, selectedItem: item }));
  };

  const fetchMenuItems = async () => {
    // TODO: Replace with actual Terminal.shop API call
    const mockItems: MenuItem[] = [
      { id: "1", name: "Espresso", price: 3.5, description: "Strong coffee" },
      { id: "2", name: "Latte", price: 4.5, description: "Coffee with milk" },
    ];
    setState((prev) => ({ ...prev, menuItems: mockItems }));
  };

  return (
    <GameStateContext.Provider value={{ ...state, selectItem, fetchMenuItems }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context)
    throw new Error("useGameState must be used within GameStateProvider");
  return context;
}
