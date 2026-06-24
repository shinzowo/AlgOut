import React, { useState, useRef } from "react";
import InteractiveGraph, { useGraph } from "../components/InteractiveGraph";
import "./BFSPage.css";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const TOOLS = [
  { id: "addNode", label: "➕ Вершина" },
  { id: "addEdge", label: "🔗 Ребро" },
  { id: "move",    label: "✋ Переместить" },
  { id: "delete",  label: "🗑 Удалить" },
];

export default function BFSPage() {
  const graph = useGraph(false);
  const { nodes, edges, buildAdj, reset: resetGraph } = graph;

  const [tool, setTool]       = useState("addNode");
  const [start, setStart]     = useState("");
  const [visited, setVisited] = useState([]);
  const [queue, setQueue]     = useState([]);
  const [current, setCurrent] = useState(null);
  const [activeEdges, setActiveEdges] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [speed, setSpeed]     = useState(700);
  const [log, setLog]         = useState([]);
  const stopRef = useRef(false);

  const resetAlgo = () => {
    stopRef.current = true;
    setVisited([]); setQueue([]); setCurrent(null);
    setActiveEdges([]); setDone(false); setLog([]);
    setRunning(false);
  };

  const fullReset = () => { resetAlgo(); resetGraph(); setStart(""); };

  const runBFS = async () => {
    if (!start || !nodes.find(n => n.id === start)) return;
    resetAlgo();
    await sleep(80);
    stopRef.current = false;
    setRunning(true);

    const adj = buildAdj();
    const vis = [], q = [start], edgesVis = [], steps = [];
    setQueue([...q]);

    while (q.length > 0) {
      if (stopRef.current) break;
      const cur = q.shift();
      if (vis.includes(cur)) { setQueue([...q]); continue; }
      vis.push(cur);
      setCurrent(cur); setVisited([...vis]); setQueue([...q]);
      steps.push(`Посещаем ${cur}  →  очередь: [${q.join(", ")}]`);
      setLog([...steps]);
      await sleep(speed);

      for (const { node: nb } of adj[cur] || []) {
        if (!vis.includes(nb) && !q.includes(nb)) {
          q.push(nb);
          edgesVis.push([cur, nb]);
          setActiveEdges([...edgesVis]);
          setQueue([...q]);
        }
      }
      await sleep(speed / 2);
    }

    if (!stopRef.current) { setCurrent(null); setDone(true); }
    setRunning(false);
  };

  const nodeColor = (id) => {
    if (id === current)           return "#f59e0b";
    if (visited.includes(id))     return "#22c55e";
    if (queue.includes(id))       return "#818cf8";
    if (id === start)             return "#60a5fa";
    return "#4d54db";
  };

  const edgeClass = (a, b) => {
    const active = activeEdges.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
    const vis    = visited.includes(a) && visited.includes(b);
    if (active) return "ig-edge ig-edge--active";
    if (vis)    return "ig-edge ig-edge--visited";
    return "ig-edge";
  };

  return (
    <div className="bfs-page">
      <div className="bfs-description">
        <h2>Обход в ширину (BFS)</h2>
        <p>Посещает все вершины текущего уровня перед переходом к следующему.
          Использует <strong>очередь</strong> (FIFO).</p>
        <div className="bfs-legend">
          <span className="bfs-legend-item" style={{background:"#60a5fa"}}>Старт</span>
          <span className="bfs-legend-item" style={{background:"#f59e0b"}}>Текущая</span>
          <span className="bfs-legend-item" style={{background:"#818cf8"}}>В очереди</span>
          <span className="bfs-legend-item" style={{background:"#22c55e"}}>Посещена</span>
        </div>
        <div className="bfs-complexity">Сложность: <strong>O(V + E)</strong></div>
      </div>

      {/* Toolbar */}
      <div className="bfs-toolbar">
        {TOOLS.map(t => (
          <button key={t.id}
            className={`bfs-tool ${tool === t.id ? "bfs-tool--active" : ""}`}
            onClick={() => setTool(t.id)}
            disabled={running}
          >{t.label}</button>
        ))}
        <span className="bfs-divider"/>
        <label className="bfs-label">Старт:
          <select value={start} onChange={e => setStart(e.target.value)} disabled={running}>
            <option value="">—</option>
            {nodes.map(n => <option key={n.id}>{n.id}</option>)}
          </select>
        </label>
        <label className="bfs-speed-label">Скорость
          <input type="range" min={100} max={1500} step={100}
            value={1600 - speed} onChange={e => setSpeed(1600 - +e.target.value)}/>
        </label>
        <button className="bfs-btn bfs-btn--primary"
          onClick={runBFS} disabled={running || !start || nodes.length < 2}>
          {running ? "Идёт обход..." : "▶ Запустить BFS"}
        </button>
        <button className="bfs-btn bfs-btn--secondary" onClick={resetAlgo} disabled={!done && !running}>
          Сбросить путь
        </button>
        <button className="bfs-btn bfs-btn--danger" onClick={fullReset} disabled={running}>
          🗑 Очистить граф
        </button>
      </div>

      <div className="bfs-hint">
        {tool === "addNode" && "Кликни на пустое место — добавится вершина"}
        {tool === "addEdge" && "Кликни на вершину и потяни к другой — добавится ребро"}
        {tool === "move"    && "Зажми вершину и перетащи её"}
        {tool === "delete"  && "Кликни на вершину или ребро — удалится"}
      </div>

      <div className="bfs-main">
        <div className="bfs-graph-wrap">
          <InteractiveGraph
            graph={graph}
            mode={running ? "move" : tool}
            disabled={running}
            nodeColor={nodeColor}
            edgeClass={edgeClass}
          />
        </div>

        <div className="bfs-log">
          <div className="bfs-log-title">Шаги</div>
          <div className="bfs-queue-display">
            <strong>Очередь:</strong> {queue.length > 0 ? `[${queue.join(" → ")}]` : "пусто"}
          </div>
          <ul className="bfs-log-list">
            {log.map((l, i) => (
              <li key={i} className={i === log.length - 1 ? "bfs-log-active" : ""}>{l}</li>
            ))}
          </ul>
          {done && (
            <div className="bfs-done">✅ Порядок: {visited.join(" → ")}</div>
          )}
        </div>
      </div>

      <div className="bfs-nav">
        <button className="bfs-btn bfs-btn--secondary" onClick={() => window.history.back()}>← Назад</button>
      </div>
    </div>
  );
}
