import React from "react";

export default function LogPanel({ lines }: { lines: string[] }) {
  return <div className="log">{lines.slice(-200).join("\n")}</div>;
}
