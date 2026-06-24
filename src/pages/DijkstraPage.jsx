import React, { useState, useRef } from "react";
import InteractiveGraph, { useGraph } from "../components/InteractiveGraph";
import "./DijkstraPage.css";

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const INF = Infinity;

const TOOLS = [
  { id: "addNode", label: "➕ Вершина" },
  { id: "addEdge", label: "🔗 Ребро (с весом)" },
  { id: "move",    label: "✋ Переместить" },
  { id: "delete",  label: "🗑 Удалить" },
];

export default function DijkstraPage() {
  const graph = useGraph(true);
  const { nodes, edges, buildAdj, reset: resetGraph } = graph;

  const [tool, setTool]         = useState("addNode");
  const [start, setStart]       = useState("");
  const [target, setTarget]     = useState("");
  const [dist, setDist]         = useState({});
  const [visited, setVisited]   = useState([]);
  const [current, setCurrent]   = useState(null);
  const [path, setPath]         = useState([]);
  const [pathEdges, setPathEdges]     = useState([]);
  const [visitedEdges, setVisitedEdges] = useState([]);
  const [running, setRunning]   = useState(false);
  const [done, setDone]         = useState(false);
  const [speed, setSpeed]       = useState(700);
  const [log, setLog]           = useState([]);
  const stopRef = useRef(false);

  const resetAlgo = () => {
    stopRef.current = true;
    setDist({}); setVisited([]); setCurrent(null);
    setPath([]); setPathEdges([]); setVisitedEdges([]);
    setRunning(false); setDone(false); setLog([]);
  };

  const fullReset = () => { resetAlgo(); resetGraph(); setStart(""); setTarget(""); };

  const runDijkstra = async () => {
    if (!start || !target || start === target) return;
    if (!nodes.find(n => n.id === start) || !nodes.find(n => n.id === target)) return;
    resetAlgo();
    await sleep(80);
    stopRef.current = false;
    setRunning(true);

    const adj  = buildAdj();
    const d    = Object.fromEntries(nodes.map(n => [n.id, INF]));
    const prev = {};
    const vis  = new Set();
    const steps = [];
    d[start] = 0;
    setDist({ ...d });

    for (let iter = 0; iter < nodes.length; iter++) {
      if (stopRef.current) break;
      let u = null;
      nodes.forEach(({ id }) => {
        if (!vis.has(id) && (u === null || d[id] < d[u])) u = id;
      });
      if (u === null || d[u] === INF) break;

      vis.add(u);
      setCurrent(u); setVisited([...vis]);
      steps.push(`Посещаем ${u}  (d=${d[u]})`);
      setLog([...steps]);
      await sleep(speed);

      for (const { node: v, w } of adj[u] || []) {
        if (stopRef.current) break;
        if (d[u] + w < d[v]) {
          d[v] = d[u] + w;
          prev[v] = u;
          setDist({ ...d });
          setVisitedEdges(e => [...e, [u, v]]);
          steps.push(`  ↳ ${v}: d=${d[v]}`);
          setLog([...steps]);
          await sleep(speed / 2);
        }
      }
    }

    if (!stopRef.current) {
      const p = [];
      let cur = target;
      while (cur !== undefined) { p.unshift(cur); cur = prev[cur]; }
      const valid = p[0] === start;
      setPath(valid ? p : []);
      const pe = [];
      for (let i = 0; i < p.length - 1; i++) pe.push([p[i], p[i+1]]);
      setPathEdges(valid ? pe : []);
      setCurrent(null); setDone(true);
    }
    setRunning(false);
  };

  const nodeColor = (id) => {
    if (path.includes(id))        return "#f59e0b";
    if (id === current)           return "#e879f9";
    if (visited.has ? visited.has(id) : visited.includes(id)) return "#22c55e";
    if (id === start)             return "#60a5fa";
    if (id === target)            return "#ef4444";
    return "#4d54db";
  };

  const edgeClass = (a, b) => {
    const isPath = pathEdges.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
    const isVis  = visitedEdges.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
    if (isPath) return "ig-edge ig-edge--path";
    if (isVis)  return "ig-edge ig-edge--visited";
    return "ig-edge";
  };

  const totalCost = path.length > 1 && dist[target] !== INF ? dist[target] : null;

  return (
    <div className="dijk-page">
      <div className="dijk-desc">
        <h2>Алгоритм Дейкстры</h2>
        <p>Находит кратчайшие пути от стартовой вершины в <strong>взвешенном графе</strong> (веса ≥ 0).
          При добавлении ребра появится окошко для ввода веса.</p>
        <div className="dijk-legend">
          <span className="dijk-chip" style={{background:"#60a5fa"}}>Старт</span>
          <span className="dijk-chip" style={{background:"#ef4444"}}>Финиш</span>
          <span className="dijk-chip" style={{background:"#e879f9"}}>Текущая</span>
          <span className="dijk-chip" style={{background:"#22c55e"}}>Посещена</span>
          <span className="dijk-chip" style={{background:"#f59e0b"}}>Кратчайший путь</span>
        </div>
        <div className="dijk-complexity">
          Сложность: <strong>O(V²)</strong>
        </div>
      </div>

      <div className="dijk-toolbar">
        {TOOLS.map(t => (
          <button key={t.id}
            className={`dijk-tool ${tool === t.id ? "dijk-tool--active" : ""}`}
            onClick={() => setTool(t.id)}
            disabled={running}
          >{t.label}</button>
        ))}
        <span className="dijk-divider"/>
        <label className="dijk-label">От:
          <select value={start} onChange={e => setStart(e.target.value)} disabled={running}>
            <option value="">—</option>
            {nodes.map(n => <option key={n.id}>{n.id}</option>)}
          </select>
        </label>
        <label className="dijk-label">До:
          <select value={target} onChange={e => setTarget(e.target.value)} disabled={running}>
            <option value="">—</option>
            {nodes.map(n => <option key={n.id}>{n.id}</option>)}
          </select>
        </label>
        <label className="dijk-speed">Скорость
          <input type="range" min={100} max={1500} step={100}
            value={1600 - speed} onChange={e => setSpeed(1600 - +e.target.value)}/>
        </label>
        <button className="dijk-btn dijk-btn--primary"
          onClick={runDijkstra}
          disabled={running || !start || !target || start === target || nodes.length < 2}>
          {running ? "Считаем..." : "▶ Запустить"}
        </button>
        <button className="dijk-btn dijk-btn--secondary" onClick={resetAlgo} disabled={!done && !running}>
          Сбросить путь
        </button>
        <button className="dijk-btn dijk-btn--danger" onClick={fullReset} disabled={running}>
          🗑 Очистить граф
        </button>
      </div>

      <div className="dijk-hint">
        {tool === "addNode" && "Кликни на пустое место — добавится вершина"}
        {tool === "addEdge" && "Потяни от вершины к вершине — появится окошко для ввода веса"}
        {tool === "move"    && "Зажми вершину и перетащи её"}
        {tool === "delete"  && "Кликни на вершину или ребро — удалится"}
      </div>

      <div className="dijk-main">
        <div className="dijk-graph-wrap">
          <InteractiveGraph
            graph={graph}
            mode={running ? "move" : tool}
            weighted={true}
            disabled={running}
            nodeColor={nodeColor}
            edgeClass={edgeClass}
          />
        </div>

        <div className="dijk-panel">
          <div className="dijk-panel-title">Расстояния</div>
          <table className="dijk-table">
            <thead><tr><th>Вершина</th><th>d(v)</th><th>✓</th></tr></thead>
            <tbody>
              {nodes.map(({ id }) => (
                <tr key={id} className={
                  path.includes(id) ? "dijk-tr--path" :
                  current === id    ? "dijk-tr--cur"  :
                  visited.includes(id) ? "dijk-tr--vis" : ""
                }>
                  <td>{id}</td>
                  <td>{dist[id] === undefined ? "∞" : dist[id] === INF ? "∞" : dist[id]}</td>
                  <td>{visited.includes(id) ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="dijk-panel-title" style={{marginTop:14}}>Шаги</div>
          <ul className="dijk-log">
            {log.map((l, i) => (
              <li key={i} className={i === log.length - 1 ? "dijk-log--active" : ""}>{l}</li>
            ))}
          </ul>

          {done && path.length > 1 && (
            <div className="dijk-result">
              ✅ {start} → {target}<br/>
              Путь: <strong>{path.join(" → ")}</strong><br/>
              Стоимость: <strong>{totalCost ?? "—"}</strong>
            </div>
          )}
          {done && path.length <= 1 && (
            <div className="dijk-result dijk-result--err">
              ❌ Путь от {start} до {target} не найден
            </div>
          )}
        </div>
      </div>

      <div className="dijk-nav">
        <button className="dijk-btn dijk-btn--secondary" onClick={() => window.history.back()}>← Назад</button>
      </div>
    </div>
  );
}
