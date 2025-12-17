import React, { useMemo, useState } from "react";
import type { GameState, Order, PlayerId } from "../types";
import { TERRITORY_BY_ID } from "../map";  // Correct path
import { validateOrder } from "../engine/validate";
import { computeReinforcements } from "../engine/resolve";

export default function Sidebar(props: {
  state: GameState;
  selectedId: string | null;
  onAddOrder: (order: Order) => void;
  onRemoveOrder: (playerId: PlayerId, index: number) => void;
  onConfirmPlayer: (playerId: PlayerId) => void;
  onResolveRound: () => void;
  onNewGame: () => void;
}) {
  const { state } = props;
  const p = state.currentPlanner;
  const orders = state.ordersByPlayer[p] ?? [];
  const [err, setErr] = useState<string | null>(null);
  const [reinforceTerritory, setReinforceTerritory] = useState<string>("");
  const [reinforceUnits, setReinforceUnits] = useState<number>(1);
  const [attackFrom, setAttackFrom] = useState<string>("");
  const [attackTo, setAttackTo] = useState<string>("");
  const [attackDice, setAttackDice] = useState<1 | 2 | 3>(3);
  const [fortFrom, setFortFrom] = useState<string>("");
  const [fortTo, setFortTo] = useState<string>("");
  const [fortUnits, setFortUnits] = useState<number>(1);

  const reinfBudget = computeReinforcements(state, p);

  const ownedIds = useMemo(() => {
    return Object.keys(state.ownerByTerritory).filter((tid) => state.ownerByTerritory[tid] === p);
  }, [state.ownerByTerritory, p]);

  const suppliedOwnedIds = useMemo(() => {
    return ownedIds.filter((tid) => state.suppliedByTerritory[tid]);
  }, [ownedIds, state.suppliedByTerritory]);

  const neighborOptions = (fromId: string) => {
    if (!fromId) return [];
    return TERRITORY_BY_ID[fromId].neighbors;
  };

  function tryAdd(order: Order) {
    const msg = validateOrder(state, order);
    if (msg) {
      setErr(msg);
      return;
    }
    setErr(null);
    props.onAddOrder(order);
  }

  const allConfirmed = state.planningConfirmed.every(Boolean);

  return (
    <div className="vstack">
      {/* ... the rest of your Sidebar JSX ... */}
      {/* In the three <select> options, replace the .map with: */}
      {suppliedOwnedIds.map((tid: string) => (
        <option key={tid} value={tid}>{tid}</option>
      ))}

      {/* Do the same for the other two .map calls in attack and fortify sections */}
      {/* Keep the rest of the JSX exactly as you had it */}
    </div>
  );
}
