import React, { useState, useRef, useCallback } from "react";
import "./AStarPage.css";

const ROWS = 14, COLS = 22;
const CELL = { EMPTY:0, WALL:1, START:2, END:3, OPEN:4, CLOSED:5, PATH:6 };

const makeGrid = () =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(CELL.EMPTY));

const heuristic = (a, b) =>
  Math.abs(a.r - b.r) + Math.abs(a.c - b.c); // Манхэттенское расстояние

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const DIRS = [[-1,0],[1,0],[0,-1],[0,1]];

export default function AStarPage() {
  const [grid, setGrid]       = useState(makeGrid);
  const [start, setStart]     = useState(null);
  const [end, setEnd]         = useState(null);
  const [mode, setMode]       = useState("start"); // start | end | wall | erase
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [pathLen, setPathLen] = useState(null);
  const [noPath, setNoPath]   = useState(false);
  const [speed, setSpeed]     = useState(18);
  const [stats, setStats]     = useState({ open:0, closed:0 });
  const stopRef = useRef(false);
  const mouseDown = useRef(false);

  const updateCell = useCallback((r, c, val) => {
    setGrid(g => {
      const ng = g.map(row => [...row]);
      ng[r][c] = val;
      return ng;
    });
  }, []);

  const cellClick = (r, c) => {
    if (running) return;
    if (mode === "start") {
      if (start) updateCell(start.r, start.c, CELL.EMPTY);
      if (end && end.r===r && end.c===c) return;
      setStart({r,c}); updateCell(r,c,CELL.START);
    } else if (mode === "end") {
      if (end) updateCell(end.r, end.c, CELL.EMPTY);
      if (start && start.r===r && start.c===c) return;
      setEnd({r,c}); updateCell(r,c,CELL.END);
    } else if (mode === "wall") {
      if ((start&&start.r===r&&start.c===c)||(end&&end.r===r&&end.c===c)) return;
      updateCell(r,c, CELL.WALL);
    } else {
      const cur = grid[r][c];
      if (cur === CELL.START) setStart(null);
      if (cur === CELL.END)   setEnd(null);
      updateCell(r,c, CELL.EMPTY);
    }
  };

  const cellDrag = (r, c) => {
    if (!mouseDown.current || running) return;
    if (mode === "wall" && grid[r][c] === CELL.EMPTY) updateCell(r,c,CELL.WALL);
    if (mode === "erase" && grid[r][c] === CELL.WALL)  updateCell(r,c,CELL.EMPTY);
  };

  /* ── A* ── */
  const runAStar = async () => {
    if (!start || !end) return;
    // сбросить предыдущий результат (кроме стен)
    setGrid(g => g.map((row,r) => row.map((cell,c) => {
      if (cell===CELL.OPEN||cell===CELL.CLOSED||cell===CELL.PATH) return CELL.EMPTY;
      return cell;
    })));
    setDone(false); setNoPath(false); setPathLen(null); setStats({open:0,closed:0});
    await sleep(50);
    stopRef.current = false;
    setRunning(true);

    const key = (r,c) => `${r},${c}`;
    const gScore = {}, fScore = {}, cameFrom = {};
    const openSet = new Set([key(start.r,start.c)]);
    const closedSet = new Set();
    gScore[key(start.r,start.c)] = 0;
    fScore[key(start.r,start.c)] = heuristic(start,end);

    const snapshot = (r, c, type) => {
      setGrid(g => {
        const ng = g.map(row=>[...row]);
        if (ng[r][c]!==CELL.START && ng[r][c]!==CELL.END) ng[r][c]=type;
        return ng;
      });
    };

    let iterations = 0;
    while (openSet.size > 0) {
      if (stopRef.current) break;

      // узел с минимальным fScore
      let current = null, minF = Infinity;
      for (const k of openSet) {
        if ((fScore[k]??Infinity) < minF) { minF = fScore[k]; current = k; }
      }

      const [cr,cc] = current.split(",").map(Number);

      if (cr===end.r && cc===end.c) {
        // восстановить путь
        let node = key(end.r,end.c), pathCount = 0;
        while (cameFrom[node]) {
          const [pr,pc] = node.split(",").map(Number);
          snapshot(pr,pc,CELL.PATH); pathCount++;
          node = cameFrom[node];
          await sleep(speed/2);
        }
        setPathLen(pathCount);
        setDone(true); setRunning(false); return;
      }

      openSet.delete(current);
      closedSet.add(current);
      snapshot(cr,cc,CELL.CLOSED);

      for (const [dr,dc] of DIRS) {
        const nr=cr+dr, nc=cc+dc;
        if (nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
        const nk = key(nr,nc);
        if (closedSet.has(nk)) continue;
        const g = grid[nr][nc];
        if (g===CELL.WALL) continue;

        const tentG = (gScore[current]??Infinity) + 1;
        if (tentG < (gScore[nk]??Infinity)) {
          cameFrom[nk] = current;
          gScore[nk] = tentG;
          fScore[nk] = tentG + heuristic({r:nr,c:nc},end);
          if (!openSet.has(nk)) {
            openSet.add(nk);
            snapshot(nr,nc,CELL.OPEN);
          }
        }
      }

      iterations++;
      if (iterations % 3 === 0) {
        setStats({ open:openSet.size, closed:closedSet.size });
        await sleep(speed);
      }
    }

    if (!stopRef.current) { setNoPath(true); setDone(true); }
    setRunning(false);
  };

  const reset = () => {
    stopRef.current = true;
    setGrid(makeGrid()); setStart(null); setEnd(null);
    setDone(false); setNoPath(false); setPathLen(null);
    setStats({open:0,closed:0}); setRunning(false);
  };

  const clearPath = () => {
    setGrid(g => g.map(row => row.map(cell =>
      (cell===CELL.OPEN||cell===CELL.CLOSED||cell===CELL.PATH) ? CELL.EMPTY : cell
    )));
    setDone(false); setNoPath(false); setPathLen(null);
  };

  const addMaze = () => {
    // простой лабиринт — случайные стены ~30%
    setGrid(g => g.map((row,r) => row.map((cell,c) => {
      if (cell===CELL.START||cell===CELL.END) return cell;
      return Math.random()<0.3 ? CELL.WALL : CELL.EMPTY;
    })));
  };

  const cellColor = (v) => ({
    [CELL.EMPTY]:  "#f8f8fc",
    [CELL.WALL]:   "#1e1e2e",
    [CELL.START]:  "#22c55e",
    [CELL.END]:    "#ef4444",
    [CELL.OPEN]:   "#93c5fd",
    [CELL.CLOSED]: "#6366f1",
    [CELL.PATH]:   "#fbbf24",
  }[v]);

  return (
    <div className="astar-page"
      onMouseUp={()=>(mouseDown.current=false)}
      onMouseLeave={()=>(mouseDown.current=false)}
    >
      <div className="astar-desc">
        <h2>Алгоритм A* (A-star)</h2>
        <p>
          Находит кратчайший путь в сетке с препятствиями. Комбинирует
          <strong> стоимость пути g(n)</strong> и <strong>эвристику h(n)</strong>
          (Манхэттенское расстояние), оценивая f(n) = g(n) + h(n).
          Быстрее Дейкстры — направленно идёт к цели.
        </p>
        <div className="astar-legend">
          {[
            ["#22c55e","Старт"], ["#ef4444","Финиш"], ["#1e1e2e","Стена"],
            ["#93c5fd","Открытые"], ["#6366f1","Закрытые"], ["#fbbf24","Путь"],
          ].map(([bg,label])=>(
            <span key={label} className="astar-chip" style={{background:bg,
              color:bg==="#f8f8fc"||bg==="#93c5fd"?"#333":"#fff"}}>{label}</span>
          ))}
        </div>
        <div className="astar-complexity">
          f(n) = g(n) + h(n) · Сложность: <strong>O(E log V)</strong>
        </div>
      </div>

      {/* Tool bar */}
      <div className="astar-toolbar">
        {[["start","🟢 Старт"],["end","🔴 Финиш"],["wall","⬛ Стена"],["erase","🧹 Ластик"]].map(([m,label])=>(
          <button key={m}
            className={`astar-tool ${mode===m?"astar-tool--active":""}`}
            onClick={()=>setMode(m)}>{label}
          </button>
        ))}
        <span className="astar-divider"/>
        <button className="astar-btn astar-btn--maze"  onClick={addMaze}   disabled={running}>🔀 Лабиринт</button>
        <label className="astar-speed">Скорость
          <input type="range" min={5} max={80} step={5}
            value={85-speed} onChange={e=>setSpeed(85-+e.target.value)}/>
        </label>
        <button className="astar-btn astar-btn--primary" onClick={runAStar}  disabled={running||!start||!end}>
          {running?"Поиск...":"▶ Запустить"}
        </button>
        <button className="astar-btn astar-btn--secondary" onClick={clearPath} disabled={running}>Очистить путь</button>
        <button className="astar-btn astar-btn--secondary" onClick={reset}     disabled={running}>Сбросить</button>
      </div>

      {/* Stats */}
      <div className="astar-stats">
        <span>Открытых: <strong>{stats.open}</strong></span>
        <span>Закрытых: <strong>{stats.closed}</strong></span>
        {pathLen!==null && <span>Длина пути: <strong>{pathLen}</strong> шагов</span>}
        {noPath && <span className="astar-nopth">Путь не найден ❌</span>}
        {done&&!noPath&&pathLen!==null && <span className="astar-found">Путь найден ✅</span>}
      </div>

      {/* Grid */}
      <div className="astar-grid-wrap">
        <div
          className="astar-grid"
          style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
          onMouseDown={() => (mouseDown.current = true)}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className="astar-cell"
                style={{ background: cellColor(cell) }}
                onClick={() => cellClick(r,c)}
                onMouseEnter={() => cellDrag(r,c)}
              />
            ))
          )}
        </div>
      </div>

      <div className="astar-hint">
        Выбери инструмент → кликни или тяни по сетке · Нарисуй стены и нажми ▶
      </div>

      <div className="astar-nav">
        <button className="astar-btn astar-btn--secondary" onClick={()=>window.history.back()}>← Назад</button>
      </div>
    </div>
  );
}
