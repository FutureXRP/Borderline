import React, { useMemo, useState } from "react";
import type { GameState, Order, PlayerId } from "../types";
import { TERRITORY_BY_ID } from "../map";
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
      <div className="hstack" style={{ justifyContent: "space-between" }}>
        <div className="title">BORDERLINE</div>
        <button className="btn" onClick={props.onNewGame}>New Game</button>
      </div>

      <div className="kpi">
        <div className="box">
          <div className="small">Round</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{state.round}</div>
        </div>
        <div className="box">
          <div className="small">Planner</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>P{p + 1}</div>
        </div>
        <div className="box">
          <div className="small">Reinforcements (budget)</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{reinfBudget}</div>
        </div>
        <div className="box">
          <div className="small">Orders queued</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{orders.length}/3</div>
        </div>
      </div>

      <div className="hstack" style={{ flexWrap: "wrap" }}>
        {Array.from({ length: state.config.playerCount }, (_, i) => (
          <span className="badge" key={i}>
            <strong>P{i + 1}</strong> pts: {state.pointsByPlayer[i as PlayerId]}
            {" · "}cap: {state.capitalByPlayer[i as PlayerId]}
          </span>
        ))}
      </div>

      {state.winner != null && (
        <div className="card" style={{ border: "2px solid #111" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Winner: Player {state.winner + 1}</div>
          <div className="small">Hit New Game to reset.</div>
        </div>
      )}

      <hr />

      {err && <div className="small" style={{ color: "#b91c1c", fontWeight: 800 }}>⚠ {err}</div>}

      <div className="card">
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Add Order (P{p + 1})</div>

        <div className="small" style={{ marginBottom: 4 }}>REINFORCE (only supplied)</div>
        <div className="hstack">
          <select className="input" value={reinforceTerritory} onChange={(e) => setReinforceTerritory(e.target.value)}>
            <option value="">Select territory</option>
            {suppliedOwnedIds.map((tid) => (
              <option key={tid} value={tid}>{tid}</option>
            ))}
          </select>
          <input
            className="input"
            type="number"
            min={1}
            value={reinforceUnits}
            onChange={(e) => setReinforceUnits(Number(e.target.value))}
            style={{ width: 90 }}
          />
          <button
            className="btn"
            onClick={() => {
              if (!reinforceTerritory) return setErr("Pick a territory.");
              tryAdd({ type: "REINFORCE", playerId: p, territoryId: reinforceTerritory, units: reinforceUnits });
            }}
          >
            Add
          </button>
        </div>

        <hr />

        <div className="small" style={{ marginBottom: 4 }}>ATTACK (max 1 / round)</div>
        <div className="hstack">
          <select className="input" value={attackFrom} onChange={(e) => { setAttackFrom(e.target.value); setAttackTo(""); }}>
            <option value="">From (supplied)</option>
            {suppliedOwnedIds.map((tid) => (
              <option key={tid} value={tid}>{tid}</option>
            ))}
          </select>

          <select className="input" value={attackTo} onChange={(e) => setAttackTo(e.target.value)}>
            <option value="">To (neighbor)</option>
            {neighborOptions(attackFrom).map((tid) => (
              <option key={tid} value={tid}>{tid}</option>
            ))}
          </select>

          <select className="input" value={attackDice} onChange={(e) => setAttackDice(Number(e.target.value) as 1 | 2 | 3)} style={{ width: 90 }}>
            <option value={1}>1d</option>
            <option value={2}>2d</option>
            <option value={3}>3d</option>
          </select>

          <button
            className="btn"
            onClick={() => {
              if (!attackFrom || !attackTo) return setErr("Pick from/to.");
              tryAdd({ type: "ATTACK", playerId: p, fromId: attackFrom, toId: attackTo, dice: attackDice });
            }}
          >
            Add
          </button>
        </div>

        <hr />

        <div className="small" style={{ marginBottom: 4 }}>FORTIFY (adjacent)</div>
        <div className="hstack">
          <select className="input" value={fortFrom} onChange={(e) => { setFortFrom(e.target.value); setFortTo(""); }}>
            <option value="">From</option>
            {ownedIds.map((tid) => (
              <option key={tid} value={tid}>{tid}</option>
            ))}
          </select>

          <select className="input" value={fortTo} onChange={(e) => setFortTo(e.target.value)}>
            <option value="">To (neighbor)</option>
            {neighborOptions(fortFrom).filter((tid) => state.ownerByTerritory[tid] === p).map((tid) => (
              <option key={tid} value={tid}>{tid}</option>
            ))}
          </select>

          <input
            className="input"
            type="number"
            min={1}
            value={fortUnits}
            onChange={(e) => setFortUnits(Number(e.target.value))}
            style={{ width: 90 }}
          />

          <button
            className="btn"
            onClick={() => {
              if (!fortFrom || !fortTo) return setErr("Pick from/to.");
              tryAdd({ type: "FORTIFY", playerId: p, fromId: fortFrom, toId: fortTo, units: fortUnits });
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <div className="hstack" style={{ justifyContent: "space-between" }}>
          <div style={{ fontWeight: 900 }}>Queued Orders (P{p + 1})</div>
          <div className="small">Selected: {props.selectedId ?? "—"}</div>
        </div>

        {orders.length === 0 ? (
          <div className="small">No orders yet.</div>
        ) : (
          <div className="vstack">
            {orders.map((o, idx) => (
              <div key={idx} className="hstack" style={{ justifyContent: "space-between" }}>
                <div className="small" style={{ fontWeight: 700 }}>
                  {o.type === "REINFORCE" && `REINFORCE ${o.territoryId} +${o.units}`}
                  {o.type === "ATTACK" && `ATTACK ${o.fromId}→${o.toId} (${o.dice}d)`}
                  {o.type === "FORTIFY" && `FORTIFY ${o.fromId}→${o.toId} (${o.units})`}
                </div>
                <button className="btn" onClick={() => props.onRemoveOrder(p, idx)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <hr />

        <div className="hstack" style={{ justifyContent: "space-between" }}>
          <button
            className="btn"
            disabled={state.planningConfirmed[p] || state.winner != null}
            onClick={() => props.onConfirmPlayer(p)}
          >
            {state.planningConfirmed[p] ? "Confirmed" : `Confirm P${p + 1}`}
          </button>

          <button
            className="btn"
            disabled={!allConfirmed || state.winner != null}
            onClick={props.onResolveRound}
          >
            Reveal & Resolve Round
          </button>
        </div>

        <div className="small" style={{ marginTop: 6 }}>
          Confirmed: {state.planningConfirmed.map((c, i) => `P${i + 1}:${c ? "✓" : "—"}`).join("  ")}
        </div>
      </div>
    </div>
  );
}
