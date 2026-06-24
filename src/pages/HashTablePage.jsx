import React, { useState } from "react";
import "./HashTablePage.css";

const TABLE_SIZE = 8;

/* ── Хеш-функции ── */
const hashMod   = (key, size) => {
  let h = 0;
  for (const c of String(key)) h = (h * 31 + c.charCodeAt(0)) % size;
  return h;
};

/* ── Методы ── */
const METHODS = ["Метод цепочек", "Открытая адресация (линейное)"];

export default function HashTablePage() {
  const [method, setMethod]   = useState(0);
  const [input, setInput]     = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [table, setTable]     = useState(
    Array.from({ length: TABLE_SIZE }, () => [])   // каждая ячейка — список (цепочка)
  );
  const [openTable, setOpenTable] = useState(
    Array(TABLE_SIZE).fill(null)                   // для открытой адресации
  );
  const [highlight, setHighlight] = useState(null);
  const [probePath, setProbeChain]= useState([]);
  const [log, setLog]         = useState([]);
  const [found, setFound]     = useState(null);   // null | true | false
  const [stats, setStats]     = useState({ inserts:0, collisions:0 });

  /* ── Вставка (цепочки) ── */
  const insertChain = (key) => {
    const h = hashMod(key, TABLE_SIZE);
    const newTable = table.map(row => [...row]);
    const collision = newTable[h].length > 0;
    newTable[h] = [...newTable[h], key];
    setTable(newTable);
    setHighlight(h);
    setProbeChain([h]);
    setLog(l => [`INSERT "${key}" → ячейка ${h}${collision?" (коллизия → цепочка)":""}`, ...l]);
    setStats(s => ({ inserts: s.inserts+1, collisions: s.collisions + (collision?1:0) }));
    setTimeout(() => setHighlight(null), 1200);
  };

  /* ── Вставка (открытая адресация) ── */
  const insertOpen = (key) => {
    const h0 = hashMod(key, TABLE_SIZE);
    let i = h0, probes = [], collision = false;
    while (openTable[i] !== null && openTable[i] !== "__deleted__") {
      if (openTable[i] === key) {
        setLog(l => [`INSERT "${key}" → уже существует в ячейке ${i}`, ...l]);
        return;
      }
      probes.push(i);
      i = (i + 1) % TABLE_SIZE;
      collision = true;
      if (i === h0) { setLog(l => ["Таблица заполнена!", ...l]); return; }
    }
    const newT = [...openTable];
    newT[i] = key;
    setOpenTable(newT);
    setHighlight(i);
    setProbeChain([...probes, i]);
    setLog(l => [`INSERT "${key}" → h=${h0}${collision?`, зонд: [${probes.join("→")}→${i}]`:``}`, ...l]);
    setStats(s => ({ inserts: s.inserts+1, collisions: s.collisions+(collision?1:0) }));
    setTimeout(() => { setHighlight(null); setProbeChain([]); }, 1400);
  };

  /* ── Поиск (цепочки) ── */
  const searchChain = (key) => {
    const h = hashMod(key, TABLE_SIZE);
    const ok = table[h].includes(key);
    setHighlight(h);
    setProbeChain([h]);
    setFound(ok);
    setLog(l => [`SEARCH "${key}" → ячейка ${h} → ${ok?"найден ✅":"не найден ❌"}`, ...l]);
    setTimeout(() => { setHighlight(null); setProbeChain([]); setFound(null); }, 1800);
  };

  /* ── Поиск (открытая адресация) ── */
  const searchOpen = (key) => {
    const h0 = hashMod(key, TABLE_SIZE);
    let i = h0, probes = [];
    while (openTable[i] !== null) {
      probes.push(i);
      if (openTable[i] === key) {
        setHighlight(i); setProbeChain(probes); setFound(true);
        setLog(l => [`SEARCH "${key}" → найден в ячейке ${i} (зонд: ${probes.join("→")}) ✅`, ...l]);
        setTimeout(() => { setHighlight(null); setProbeChain([]); setFound(null); }, 1800);
        return;
      }
      i = (i + 1) % TABLE_SIZE;
      if (i === h0) break;
    }
    setHighlight(null); setProbeChain(probes); setFound(false);
    setLog(l => [`SEARCH "${key}" → не найден (зонд: ${probes.join("→")}) ❌`, ...l]);
    setTimeout(() => { setProbeChain([]); setFound(null); }, 1800);
  };

  const handleInsert = () => {
    const k = input.trim();
    if (!k) return;
    method === 0 ? insertChain(k) : insertOpen(k);
    setInput("");
  };

  const handleSearch = () => {
    const k = searchKey.trim();
    if (!k) return;
    method === 0 ? searchChain(k) : searchOpen(k);
  };

  const handleReset = () => {
    setTable(Array.from({ length: TABLE_SIZE }, () => []));
    setOpenTable(Array(TABLE_SIZE).fill(null));
    setHighlight(null); setProbeChain([]); setLog([]);
    setFound(null); setStats({ inserts:0, collisions:0 });
  };

  const loadFactor = method === 0
    ? (stats.inserts / TABLE_SIZE).toFixed(2)
    : (openTable.filter(x => x !== null && x !== "__deleted__").length / TABLE_SIZE).toFixed(2);

  return (
    <div className="ht-page">
      {/* Description */}
      <div className="ht-desc">
        <h2>Хеш-таблица</h2>
        <p>
          Структура данных, обеспечивающая вставку, поиск и удаление за
          <strong> O(1)</strong> в среднем. Ключ преобразуется хеш-функцией в индекс
          массива. При коллизии (два ключа → один индекс) используются стратегии разрешения.
        </p>
        <div className="ht-legend">
          <span className="ht-chip ht-chip--active">Активная ячейка</span>
          <span className="ht-chip ht-chip--probe">Путь зондирования</span>
          <span className="ht-chip ht-chip--empty">Пустая ячейка</span>
        </div>
        <div className="ht-complexity">
          Вставка / Поиск / Удаление: <strong>O(1)</strong> среднее · <strong>O(n)</strong> худшее
        </div>
      </div>

      {/* Method switcher */}
      <div className="ht-method-tabs">
        {METHODS.map((m, i) => (
          <button
            key={i}
            className={`ht-tab ${method === i ? "ht-tab--active" : ""}`}
            onClick={() => { setMethod(i); handleReset(); }}
          >{m}</button>
        ))}
      </div>

      {/* Controls */}
      <div className="ht-controls">
        <div className="ht-input-group">
          <input className="ht-input" value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleInsert()}
            placeholder="Ключ для вставки (слово или число)"/>
          <button className="ht-btn ht-btn--primary" onClick={handleInsert}>Вставить</button>
        </div>
        <div className="ht-input-group">
          <input className="ht-input" value={searchKey}
            onChange={e=>setSearchKey(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSearch()}
            placeholder="Поиск ключа"/>
          <button className="ht-btn ht-btn--search" onClick={handleSearch}>Найти</button>
        </div>
        <button className="ht-btn ht-btn--secondary" onClick={handleReset}>Сбросить</button>
      </div>

      {/* Stats */}
      <div className="ht-stats">
        <span>Элементов: <strong>{stats.inserts}</strong></span>
        <span>Коллизий: <strong>{stats.collisions}</strong></span>
        <span>Коэф. заполнения: <strong>{loadFactor}</strong></span>
        <span>Размер таблицы: <strong>{TABLE_SIZE}</strong></span>
      </div>

      {/* Main visual */}
      <div className="ht-main">
        {/* Table */}
        <div className="ht-table-visual">
          {Array.from({ length: TABLE_SIZE }, (_, i) => {
            const isHL   = highlight === i;
            const isProbe= probeChain.includes(i) && !isHL;
            const cells  = method === 0 ? table[i] : (openTable[i] ? [openTable[i]] : []);
            return (
              <div key={i} className={`ht-row ${isHL?"ht-row--active":""} ${isProbe?"ht-row--probe":""}`}>
                <div className="ht-index">{i}</div>
                <div className="ht-hash-icon">h={hashMod(cells[0]??"-",TABLE_SIZE)===i && cells.length>0 ? i : "·"}</div>
                <div className="ht-bucket">
                  {cells.length === 0
                    ? <span className="ht-empty">∅</span>
                    : cells.map((k,j) => (
                        <span key={j} className="ht-key-chip">{k}</span>
                      ))
                  }
                  {method === 0 && cells.length > 1 && (
                    <span className="ht-chain-icon">⛓ {cells.length}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Log */}
        <div className="ht-log-panel">
          <div className="ht-panel-title">История операций</div>
          {found === true  && <div className="ht-found ht-found--ok">✅ Найден</div>}
          {found === false && <div className="ht-found ht-found--err">❌ Не найден</div>}
          <ul className="ht-log">
            {log.map((l,i)=>(
              <li key={i} className={i===0?"ht-log--active":""}>{l}</li>
            ))}
          </ul>

          <div className="ht-panel-title" style={{marginTop:16}}>Хеш-функция</div>
          <div className="ht-hash-formula">
            h(key) = Σ(code(c) × 31ⁱ) mod {TABLE_SIZE}
          </div>
          <div className="ht-tip">
            Попробуй ввести: <em>apple, banana, cat, dog, apple</em> — увидишь коллизию!
          </div>
        </div>
      </div>

      <div className="ht-nav">
        <button className="ht-btn ht-btn--secondary" onClick={()=>window.history.back()}>← Назад</button>
      </div>
    </div>
  );
}
