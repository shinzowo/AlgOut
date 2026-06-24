// src/components/InteractiveGraph.jsx
// Общий интерактивный граф: добавление вершин, рёбер, перетаскивание, удаление
import React, { useState, useRef, useCallback } from "react";
import "./InteractiveGraph.css";

const NODE_R = 24;

export function useGraph(weighted = false) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const idRef = useRef(0);

  const addNode = (x, y) => {
    const id = String.fromCharCode(65 + (idRef.current % 26)) +
      (idRef.current >= 26 ? Math.floor(idRef.current / 26) : "");
    idRef.current++;
    setNodes(n => [...n, { id, x, y }]);
    return id;
  };

  const addEdge = (from, to, w = 1) => {
    // не дублировать
    setEdges(e => {
      const exists = e.some(
        ed => (ed.from === from && ed.to === to) || (ed.from === to && ed.to === from)
      );
      if (exists || from === to) return e;
      return [...e, { from, to, w: weighted ? w : 1 }];
    });
  };

  const removeNode = (id) => {
    setNodes(n => n.filter(nd => nd.id !== id));
    setEdges(e => e.filter(ed => ed.from !== id && ed.to !== id));
  };

  const removeEdge = (from, to) => {
    setEdges(e => e.filter(ed => !(ed.from === from && ed.to === to) && !(ed.from === to && ed.to === from)));
  };

  const updateNodePos = (id, x, y) => {
    setNodes(n => n.map(nd => nd.id === id ? { ...nd, x, y } : nd));
  };

  const updateEdgeWeight = (from, to, w) => {
    setEdges(e => e.map(ed =>
      (ed.from === from && ed.to === to) || (ed.from === to && ed.to === from)
        ? { ...ed, w }
        : ed
    ));
  };

  const reset = () => {
    setNodes([]); setEdges([]); idRef.current = 0;
  };

  const buildAdj = () => {
    const adj = {};
    nodes.forEach(n => (adj[n.id] = []));
    edges.forEach(({ from, to, w }) => {
      adj[from].push({ node: to, w });
      adj[to].push({ node: from, w });
    });
    return adj;
  };

  return { nodes, edges, addNode, addEdge, removeNode, removeEdge,
           updateNodePos, updateEdgeWeight, reset, buildAdj };
}

// ── Компонент ──────────────────────────────────────────────────────────────
export default function InteractiveGraph({
  graph,
  mode,           // "addNode" | "addEdge" | "move" | "delete"
  weighted = false,
  nodeColor,      // (id) => string
  edgeClass,      // (from, to) => string
  edgeLabel,      // (edge) => string  (для Дейкстры показывает вес)
  disabled = false,
}) {
  const { nodes, edges, addNode, addEdge, removeNode, removeEdge,
          updateNodePos, updateEdgeWeight } = graph;

  const svgRef   = useRef(null);
  const dragRef  = useRef(null);   // { id, ox, oy }
  const edgeSrc  = useRef(null);   // id первой вершины при addEdge
  const [edgePrev, setEdgePrev] = useState(null); // {x,y} мыши при протягивании ребра
  const [weightModal, setWeightModal] = useState(null); // {from,to,w}

  /* SVG координаты */
  const svgXY = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const nodeAt = (x, y) =>
    nodes.find(n => Math.hypot(n.x - x, n.y - y) < NODE_R);

  /* ── Mouse handlers ── */
  const onMouseDown = useCallback((e) => {
    if (disabled) return;
    const { x, y } = svgXY(e);
    const hit = nodeAt(x, y);

    if (mode === "addNode" && !hit) {
      addNode(x, y);
    } else if (mode === "addEdge") {
      if (hit) { edgeSrc.current = hit.id; setEdgePrev({ x, y }); }
    } else if (mode === "move" && hit) {
      dragRef.current = { id: hit.id, ox: x - hit.x, oy: y - hit.y };
    } else if (mode === "delete") {
      if (hit) removeNode(hit.id);
    }
  }, [disabled, mode, nodes]);

  const onMouseMove = useCallback((e) => {
    if (disabled) return;
    const { x, y } = svgXY(e);
    if (mode === "move" && dragRef.current) {
      updateNodePos(dragRef.current.id,
        x - dragRef.current.ox, y - dragRef.current.oy);
    }
    if (mode === "addEdge" && edgeSrc.current) {
      setEdgePrev({ x, y });
    }
  }, [disabled, mode]);

  const onMouseUp = useCallback((e) => {
    if (disabled) return;
    const { x, y } = svgXY(e);
    if (mode === "addEdge" && edgeSrc.current) {
      const hit = nodeAt(x, y);
      if (hit && hit.id !== edgeSrc.current) {
        if (weighted) {
          setWeightModal({ from: edgeSrc.current, to: hit.id, w: 1 });
        } else {
          addEdge(edgeSrc.current, hit.id);
        }
      }
      edgeSrc.current = null; setEdgePrev(null);
    }
    dragRef.current = null;
  }, [disabled, mode, nodes, weighted]);

  const onEdgeClick = (from, to) => {
    if (disabled) return;
    if (mode === "delete") removeEdge(from, to);
  };

  /* Подтвердить вес */
  const confirmWeight = () => {
    if (!weightModal) return;
    addEdge(weightModal.from, weightModal.to, Number(weightModal.w) || 1);
    setWeightModal(null);
  };

  const midpoint = (a, b) => ({
    x: (a.x + b.x) / 2, y: (a.y + b.y) / 2,
  });

  const defaultNodeColor = () => "#4d54db";
  const defaultEdgeClass = () => "ig-edge";
  const nc = nodeColor || defaultNodeColor;
  const ec = edgeClass || defaultEdgeClass;

  return (
    <div className="ig-wrap">
      <svg
        ref={svgRef}
        className="ig-svg"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => { dragRef.current = null; edgeSrc.current = null; setEdgePrev(null); }}
      >
        {/* Ребра */}
        {edges.map((ed, i) => {
          const na = nodes.find(n => n.id === ed.from);
          const nb = nodes.find(n => n.id === ed.to);
          if (!na || !nb) return null;
          const m = midpoint(na, nb);
          const cls = ec(ed.from, ed.to);
          return (
            <g key={i} onClick={() => onEdgeClick(ed.from, ed.to)} style={{ cursor: mode === "delete" ? "pointer" : "default" }}>
              <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} className={cls} />
              {weighted && (
                <>
                  <rect x={m.x - 14} y={m.y - 11} width={28} height={20} rx={5}
                    fill="#fff" stroke="#ccc" strokeWidth={1} />
                  <text x={m.x} y={m.y + 5} textAnchor="middle"
                    fontSize="11" fontWeight="700" fill="#333">
                    {edgeLabel ? edgeLabel(ed) : ed.w}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* Предварительное ребро при протягивании */}
        {edgePrev && edgeSrc.current && (() => {
          const src = nodes.find(n => n.id === edgeSrc.current);
          return src ? (
            <line x1={src.x} y1={src.y} x2={edgePrev.x} y2={edgePrev.y}
              stroke="#94a3b8" strokeWidth={2} strokeDasharray="6,4" />
          ) : null;
        })()}

        {/* Вершины */}
        {nodes.map(n => (
          <g key={n.id} style={{ cursor: mode === "move" ? "grab" : "pointer" }}>
            <circle cx={n.x} cy={n.y} r={NODE_R}
              fill={nc(n.id)}
              className="ig-node"
            />
            <text x={n.x} y={n.y + 5} textAnchor="middle"
              fill="#fff" fontSize="14" fontWeight="700" pointerEvents="none">
              {n.id}
            </text>
          </g>
        ))}
      </svg>

      {/* Модалка веса */}
      {weightModal && (
        <div className="ig-modal-overlay">
          <div className="ig-modal">
            <div className="ig-modal-title">
              Вес ребра {weightModal.from} → {weightModal.to}
            </div>
            <input
              type="number" min={1} max={99}
              value={weightModal.w}
              onChange={e => setWeightModal(m => ({ ...m, w: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && confirmWeight()}
              autoFocus
            />
            <div className="ig-modal-btns">
              <button onClick={confirmWeight}>Добавить</button>
              <button onClick={() => setWeightModal(null)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
