"use client";

import React from "react";
import { createApi, ApiProvider } from "@danstackme/apity";
import { GameScene } from "./components/game/GameScene";
import { fetchEndpoints, mutateEndpoints } from "../endpoints";
import { useState } from "react";
import { CartDisplay, CartItem } from "./components/game/CartDisplay";

import axios from "axios";

axios.defaults.baseURL = "https://api.dev.terminal.shop";
axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${process.env.NEXT_PUBLIC_TERMINAL_BEARER_TOKEN}`;

const api = createApi({
  baseUrl: "https://api.dev.terminal.shop",
  fetchEndpoints,
  mutateEndpoints,
  client: axios,
});

export default function Home() {
  // Cart state in the main page component
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  return (
    <ApiProvider api={api}>
      <main className="min-h-screen">
        {/* Cart display completely outside the 3D scene */}
        <CartDisplay
          cart={cart}
          setCart={setCart}
          lastAdded={lastAdded}
          setLastAdded={setLastAdded}
        />

        <GameScene
          cart={cart}
          setCart={setCart}
          lastAdded={lastAdded}
          setLastAdded={setLastAdded}
        />
      </main>
    </ApiProvider>
  );
}
