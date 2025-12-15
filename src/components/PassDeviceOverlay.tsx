import React from "react";

export default function PassDeviceOverlay(props: {
  visible: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  onContinue: () => void;
}) {
  if (!props.visible) return null;
  return (
    <div className="overlay">
      <div className="overlay-card">
        <div className="title" style={{ fontSize: 22, marginBottom: 6 }}>{props.title}</div>
        <div className="small" style={{ marginBottom: 14 }}>{props.subtitle}</div>
        <button className="btn" onClick={props.onContinue}>{props.buttonText}</button>
      </div>
    </div>
  );
}
