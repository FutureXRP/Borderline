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
      if (playerId === s.currentPlanner) {
        for (let i = 1; i <= s.config.playerCount; i++) {
          const candidate = ((playerId + i) %
            s.config.playerCount) as PlayerId;
          if (!confirmed[candidate]) {
            nextPlanner = candidate;
            break;
          }
        }
      }

      return {
        ...s,
        planningConfirmed: confirmed,
        currentPlanner: nextPlanner,
      };
    });

    setTimeout(() => {
      setState((s) => {
        const anyUnconfirmed = s.planningConfirmed.some((c) => !c);
        if (anyUnconfirmed) showPassOverlay(s.currentPlanner);
        return s;
      });
    }, 0);
  }

  function onResolveRound() {
    setState((s) => resolveRound(s));
    setSelectedId(null);
    setOverlayVisible(false);
  }

  function onNewGame() {
    const cfg = makeConfig(playerCount, seed);
    setState(newGame(cfg));
    setSelectedId(null);
    setOverlayVisible(false);
  }

  return (
    <>
      <PassDeviceOverlay
        visible={overlayVisible}
        title={overlayText.title}
        subtitle={overlayText.subtitle}
        buttonText={overlayText.btn}
        onContinue={() => setOverlayVisible(false)}
      />

      <div className="app">
        <div className="card vstack">
          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <div className="title">Map</div>

            <div className="hstack">
              <span className="small">Players</span>
              <select
                className="input"
                style={{ width: 90 }}
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>

              <span className="small">Seed</span>
              <input
                className="input"
                style={{ width: 140 }}
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
              />

              <button className="btn" onClick={onNewGame}>
                Start / Reset
              </button>
            </div>
          </div>

          <MapSvg
            territories={TERRITORIES}
            selectedId={selectedId}
            onSelect={setSelectedId}
            ownerByTerritory={state.ownerByTerritory}
            unitsByTerritory={state.unitsByTerritory}
            suppliedByTerritory={state.suppliedByTerritory}
            capitalByPlayer={state.capitalByPlayer}
          />

          <div className="hstack" style={{ justifyContent: "space-between" }}>
            <div className="small">
              Selected: {selectedId ?? "—"}
              {selectedId && selectedDetails ? (
                <>
                  {" · "}Owner: P{selectedDetails.owner + 1}
                  {" · "}Units: {selectedDetails.units}
                  {" · "}
                  {selectedDetails.supplied ? "Supplied" : "Unsupplied"}
                </>
              ) : null}
            </div>
            <div className="small">
              Planner: <strong>P{state.currentPlanner + 1}</strong> (hotseat)
            </div>
          </div>

          <LogPanel lines={state.log} />
        </div>

        <div className="card">
          <Sidebar
            state={state}
            selectedId={selectedId}
            onAddOrder={onAddOrder}
            onRemoveOrder={onRemoveOrder}
            onConfirmPlayer={onConfirmPlayer}
            onResolveRound={onResolveRound}
            onNewGame={onNewGame}
          />
        </div>
      </div>
    </>
  );
}
