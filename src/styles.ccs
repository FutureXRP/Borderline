:root {
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: #111;
  background: #f6f6f6;
}

* { box-sizing: border-box; }

body { margin: 0; }

.app {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 12px;
  padding: 12px;
  height: 100vh;
}

.card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  padding: 12px;
  overflow: hidden;
}

.hstack { display: flex; gap: 10px; align-items: center; }
.vstack { display: flex; flex-direction: column; gap: 10px; }

.title {
  font-weight: 800;
  letter-spacing: 0.3px;
}

.small { font-size: 12px; color: #444; }

.btn {
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 10px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 650;
}
.btn:hover { background: #f0f0f0; }
.btn:disabled { opacity: 0.55; cursor: not-allowed; }

.input, select {
  width: 100%;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #ddd;
}

hr { border: none; border-top: 1px solid #eee; margin: 8px 0; }

.badge {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  border: 1px solid #eee;
  background: #fafafa;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}

.log {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  background: #0c0c0c;
  color: #eaeaea;
  padding: 10px;
  border-radius: 12px;
  height: 220px;
  overflow: auto;
  white-space: pre-wrap;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: grid;
  place-items: center;
  z-index: 50;
}

.overlay-card {
  width: min(560px, 92vw);
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  text-align: center;
}

.kpi {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.kpi .box {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 10px;
  background: #fbfbfb;
}
