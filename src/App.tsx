import React, { useMemo, useState } from "react";
import { TERRITORIES } from "./map";
import type { GameConfig, GameState, Order, PlayerId } from "./types";
import MapSvg from "./components/MapSvg";
import Sidebar from "./components/Sidebar";
import PassDeviceOverlay from "./components/PassDeviceOverlay";
import LogPanel from "./components/LogPanel";
import { computeSuppliedByTerritory } from "./engine/supply";
import { newGame } from "./engine/init";
import { resolveRound } from "./engine/resolve";

function makeConfig(playerCount: number, seed: number): GameConfig {
  return {
    playerCount,
    seed,
    maxOrdersPerRound: 3,
    maxAttackOrdersPerRound: 1,
  };
}

export default function App() {
  const [playerCount, setPlayerCount] = useState<number>(3);
  const [seed, setSeed] = useState<number>(() =>
    Math.floor(Math.random() * 1_000_000)
  );

  const [state, setState] = useState<GameState>(() =>
    newGame(makeConfig(playerCount, seed))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);
  const [overlayText, setOverlayText] = useState<{
    title: string;
    subtitle: string;
    btn: string;
  }>({
    title: "Pass Device",
    subtitle: "Hand the device to the next player.",
    btn: "Continue",
  });

  const selectedDetails = useMemo(() => {
    if (!selectedId) return null;
    const owner = state.ownerByTerritory[selectedId];
    const units = state.unitsByTerritory[selectedId];
    const supplied = state.suppliedByTerritory[selectedId];
    return { owner, units, supplied };
  }, [selectedId, state]);

  function showPassOverlay(nextPlanner: PlayerId) {
    setOverlayText({
      title: "Pass Device",
      subtitle: `Hand the device to Player ${nextPlanner + 1}. Tap Continue when ready.`,
      btn: `Continue as P${nextPlanner + 1}`,
    });
    setOverlayVisible(true);
  }

  function onAddOrder(order: Order) {
    setState((s) => {
      const next = {
        ...s,
        ordersByPlayer: {
          ...s.ordersByPlayer,
          [order.playerId]: [
            ...(s.ordersByPlayer[order.playerId] ?? []),
            order,
          ],
        },
      };
      next.suppliedByTerritory = computeSuppliedByTerritory(
        next.ownerByTerritory,
        next.capitalByPlayer
      );
      return next;
    });
  }

  function onRemoveOrder(playerId: PlayerId, index: number) {
    setState((s) => {
      const list = [...(s.ordersByPlayer[playerId] ?? [])];
      list.splice(index, 1);
      return {
        ...s,
        ordersByPlayer: { ...s.ordersByPlayer, [playerId]: list },
      };
    });
  }

  function onConfirmPlayer(playerId: PlayerId) {
    setState((s) => {
      const confirmed = [...s.planningConfirmed];
      confirmed[playerId] = true;

      let nextPlanner = s.currentPlanner;
      if
