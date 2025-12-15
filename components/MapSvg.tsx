import React from "react";
import type { PlayerId, Territory } from "../types";

const PLAYER_COLORS = ["#d97706", "#2563eb", "#16a34a", "#dc2626"];

export default function MapSvg(props: {
  territories: Territory[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ownerByTerritory: Record<string, PlayerId>;
  unitsByTerritory: Record<string, number>;
  suppliedByTerritory: Record<string, boolean>;
  capitalByPlayer: Record<PlayerId, string>;
}) {
  const width = 760;
  const height = 420;

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ borderRadius: 12, background: "#f3f4f6" }}>
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#111" strokeWidth="1" opacity="0.25" />
        </pattern>
      </defs>

      {props.territories.map((t) => {
        const owner = props.ownerByTerritory[t.id];
        const units = props.unitsByTerritory[t.id] ?? 0;
        const isSupplied = props.suppliedByTerritory[t.id];
        const isSelected = props.selectedId === t.id;
        const isCapital =
          Object.entries(props.capitalByPlayer).some(([p, cap]) => cap === t.id && Number(p) === owner);

        const fill = PLAYER_COLORS[owner % PLAYER_COLORS.length];
        const opacity = isSupplied ? 0.95 : 0.35;

        return (
          <g key={t.id} onClick={() => props.onSelect(t.id)} style={{ cursor: "pointer" }}>
            <rect
              x={t.x}
              y={t.y}
              width={t.w}
              height={t.h}
              rx={10}
              fill={fill}
              opacity={opacity}
              stroke={isSelected ? "#111" : "#fff"}
              strokeWidth={isSelected ? 4 : 2}
            />
            {!isSupplied && (
              <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={10} fill="url(#hatch)" opacity={0.35} />
            )}

            <text x={t.x + 10} y={t.y + 22} fontSize={12} fontWeight={800} fill="#111">
              {t.id}{isCapital ? " ★" : ""}
            </text>
            <text x={t.x + 10} y={t.y + 44} fontSize={12} fontWeight={700} fill="#111">
              Units: {units}
            </text>
            <text x={t.x + 10} y={t.y + 64} fontSize={11} fill="#111" opacity={0.9}>
              {isSupplied ? "Supplied" : "Unsupplied"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
