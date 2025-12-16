import React, { useState, useEffect } from "react";
import MapSvg from "./components/MapSvg";
import Sidebar from "./components/Sidebar";
import LogPanel from "./components/LogPanel";
import PassDeviceOverlay from "./components/PassDeviceOverlay";
import { newGame } from "./engine/init";
import { resolveRound } from "./engine/resolve";
import type { GameState, Order, PlayerId, GameConfig } from "./types";
import { TERRITORY_BY_ID } from "./map";  // or "./maps" if not renamed

const INITIAL_CONFIG: GameConfig = {
  playerCount: 4,
  seed: Math.floor(Math.random() * 1_000_000_000),
  maxOrdersPerRound: 3,
  maxAttackOrdersPerRound: 1,
};

export default function App() {
  const [state, setState] = useState<GameState>(newGame(INITIAL_CONFIG));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [passOverlay, setPassOverlay] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
    buttonText: string;
  }>({ visible: false, title: "", subtitle: "", buttonText: "" });

  useEffect(() => {
    if (state.winner != null) {
      setPassOverlay({
        visible: true,
        title: "Game Over!",
        subtitle: `Player ${state.winner + 1} wins with 3+ points!`,
        buttonText: "New Game",
      });
    } else if (state.planningConfirmed.every(Boolean)) {
      // Auto-resolve when all confirmed (optional UX)
      // Or just wait for manual resolve
    }
  }, [state.winner, state.planningConfirmed]);

  function addOrder(order: Order) {
    setState((s) => ({
      ...s,
      ordersByPlayer: {
        ...s.ordersByPlayer,
        [s.currentPlanner]: [...(s.ordersByPlayer[s.currentPlanner] ?? []), order],
      },
    }));
  }

  function removeOrder(playerId: PlayerId, index: number) {
    setState((s) => ({
      ...s,
      ordersByPlayer: {
        ...s.ordersByPlayer,
        [playerId]: s.ordersByPlayer[playerId].filter((_, i) => i !== index),
      },
    }));
  }

  function confirmPlayer(playerId: PlayerId) {
    setState((s) => ({
      ...s,
      planningConfirmed: s.planningConfirmed.map((c, i) => (i === playerId ? true : c)),
      currentPlanner: (s.currentPlanner + 1) % s.config.playerCount,
    }));

    // Show pass device overlay for next player
    const next = (state.currentPlanner + 1) % state.config.playerCount;
    setPassOverlay({
      visible: true,
      title: `Player ${next + 1}'s Turn`,
      subtitle: `Round ${state.round} Planning`,
      buttonText: "Continue",
    });
  }

  function handleResolveRound() {
    setState(resolveRound(state));
    setPassOverlay({ visible: false, title: "", subtitle: "", buttonText: "" });
  }

  function handleNewGame() {
    setState(newGame(INITIAL_CONFIG));
    setPassOverlay({ visible: false, title: "", subtitle: "", buttonText: "" });
  }

  function handleOverlayContinue() {
    setPassOverlay({ visible: false, title: "", subtitle: "", buttonText: "" });
  }

  return (
    <div className="app">
      <div className="main">
        <MapSvg
          territories={Object.values(TERRITORY_BY_ID)}
          selectedId={selectedId}
          onSelect={setSelectedId}
          ownerByTerritory={state.ownerByTerritory}
          unitsByTerritory={state.unitsByTerritory}
          suppliedByTerritory={state.suppliedByTerritory}
          capitalByPlayer={state.capitalByPlayer}
        />
        <Sidebar
          state={state}
          selectedId={selectedId}
          onAddOrder={addOrder}
          onRemoveOrder={removeOrder}
          onConfirmPlayer={confirmPlayer}
          onResolveRound={handleResolveRound}
          onNewGame={handleNewGame}
        />
      </div>
      <LogPanel lines={state.log} />
      <PassDeviceOverlay
        visible={passOverlay.visible}
        title={passOverlay.title}
        subtitle={passOverlay.subtitle}
        buttonText={passOverlay.buttonText}
        onContinue={handleOverlayContinue}
      />
    </div>
  );
}
