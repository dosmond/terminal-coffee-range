"use client";

import { createApi, ApiProvider } from "@danstackme/apity";
import { GameScene } from "./components/game/GameScene";
import { fetchEndpoints, mutateEndpoints } from "../endpoints";

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
  return (
    <main className="min-h-screen">
      <ApiProvider api={api}>
        <GameScene />
      </ApiProvider>
    </main>
  );
}
