import React, { useState, useRef } from "react";
import InteractiveGraph, { useGraph } from "../components/InteractiveGraph";
import "./DFSPage.css";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const TOOLS = [
  { id: "addNode", label: "➕ Вершина" },
  { id: "addEdge", label: "🔗 Ребро" },
  { id: "move",    label: "✋ Переместить" },
  { id: "delete",  label: "🗑 Удалить" },
];

export default function DFSPage() {
  const graph = useGraph(false);
  const { nodes, edges, buildAdj, reset: resetGraph } = graph;

  const [tool, setTool]       = useState("addNode");
  const [start, setStart]     = useState("");
  const [visited, setVisited] = useState([]);
  const [stack, setStack]     = useState([]);
  const [current, setCurrent] = useState(null);
  const [activeEdges, setActiveEdges] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [speed, setSpeed]     = useState(700);
  const [log, setLog]         = useState([]);
  const stopRef = useRef(false);

  const resetAlgo = () => {
    stopRef.current = true;
    setVisited([]); setStack([]); setCurrent(null);
    setActiveEdges([]); setDone(false); setLog([]);
    setRunning(false);
  };

  const fullReset = () => { resetAlgo(); resetGraph(); setStart(""); };

  const runDFS = async () => {
    if (!start || !nodes.find(n => n.id === start)) return;
    resetAlgo();
    await sleep(80);
    stopRef.current = false;
    setRunning(true);

    const adj = buildAdj();
    const vis = [], st = [start], edgesVis = [], steps = [];
    setStack([...st]);

    while (st.length > 0) {
      if (stopRef.current) break;
      const cur = st.pop();
      setStack([...st]);
      if (vis.includes(cur)) continue;
      vis.push(cur);
      setCurrent(cur); setVisited([...vis]);
      steps.push(`Посещаем ${cur}  →  стек: [${st.join(" | ")}]`);
      setLog([...steps]);
      await sleep(speed);

      for (const { node: nb } of [...(adj[cur] || [])].reverse()) {
        if (!vis.includes(nb) && !st.includes(nb)) {
          st.push(nb);
          edgesVis.push([cur, nb]);
          setActiveEdges([...edgesVis]);
          setStack([...st]);
        }
      }
      await sleep(speed / 3);
    }

    if (!stopRef.current) { setCurrent(null); setDone(true); }
    setRunning(false);
  };

  const nodeColor = (id) => {
    if (id === current)       return "#e879f9";
    if (visited.includes(id)) return "#22c55e";
    if (stack.includes(id))   return "#fb923c";
    if (id === start)         return "#a78bfa";
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
    <div className="dfs-page">
      <div className="dfs-description">
        <h2>Обход в глубину (DFS)</h2>
        <p>Идёт как можно глубже по одному пути, затем возвращается.
          Использует <strong>стек</strong> (LIFO).</p>
        <div className="dfs-legend">
          <span className="dfs-legend-item" style={{background:"#a78bfa"}}>Старт</span>
          <span className="dfs-legend-item" style={{background:"#e879f9"}}>Текущая</span>
          <span className="dfs-legend-item" style={{background:"#fb923c"}}>В стеке</span>
          <span className="dfs-legend-item" style={{background:"#22c55e"}}>Посещена</span>
        </div>
        <div className="dfs-complexity">Сложность: <strong>O(V + E)</strong></div>
      </div>

      <div className="dfs-toolbar">
        {TOOLS.map(t => (
          <button key={t.id}
            className={`dfs-tool ${tool === t.id ? "dfs-tool--active" : ""}`}
            onClick={() => setTool(t.id)}
            disabled={running}
          >{t.label}</button>
        ))}
        <span className="dfs-divider"/>
        <label className="dfs-label">Старт:
          <select value={start} onChange={e => setStart(e.target.value)} disabled={running}>
            <option value="">—</option>
            {nodes.map(n => <option key={n.id}>{n.id}</option>)}
          </select>
        </label>
        <label className="dfs-speed-label">Скорость
          <input type="range" min={100} max={1500} step={100}
            value={1600 - speed} onChange={e => setSpeed(1600 - +e.target.value)}/>
        </label>
        <button className="dfs-btn dfs-btn--primary"
          onClick={runDFS} disabled={running || !start || nodes.length < 2}>
          {running ? "Идёт обход..." : "▶ Запустить DFS"}
        </button>
        <button className="dfs-btn dfs-btn--secondary" onClick={resetAlgo} disabled={!done && !running}>
          Сбросить путь
        </button>
        <button className="dfs-btn dfs-btn--danger" onClick={fullReset} disabled={running}>
          🗑 Очистить граф
        </button>
      </div>

      <div className="dfs-hint">
        {tool === "addNode" && "Кликни на пустое место — добавится вершина"}
        {tool === "addEdge" && "Кликни на вершину и потяни к другой — добавится ребро"}
        {tool === "move"    && "Зажми вершину и перетащи её"}
        {tool === "delete"  && "Кликни на вершину или ребро — удалится"}
      </div>

      <div className="dfs-main">
        <div className="dfs-graph-wrap">
          <InteractiveGraph
            graph={graph}
            mode={running ? "move" : tool}
            disabled={running}
            nodeColor={nodeColor}
            edgeClass={edgeClass}
          />
        </div>

        <div className="dfs-log">
          <div className="dfs-log-title">Шаги</div>
          <div className="dfs-queue-display">
            <strong>Стек:</strong> {stack.length > 0 ? `[${stack.join(" | ")}]` : "пусто"}
          </div>
          <ul className="dfs-log-list">
            {log.map((l, i) => (
              <li key={i} className={i === log.length - 1 ? "dfs-log-active" : ""}>{l}</li>
            ))}
          </ul>
          {done && (
            <div className="dfs-done">✅ Порядок: {visited.join(" → ")}</div>
          )}
        </div>
      </div>

      <div className="dfs-nav">
        <button className="dfs-btn dfs-btn--secondary" onClick={() => window.history.back()}>← Назад</button>
      </div>
    </div>
  );
}
