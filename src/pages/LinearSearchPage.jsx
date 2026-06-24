import React, { useState, useRef } from "react";
import "./LinearSearchPage.css";

const DEFAULT_ARRAY = [8, 3, 15, 7, 22, 4, 11, 19, 6, 14];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const LinearSearchPage = () => {
  const [array, setArray] = useState([...DEFAULT_ARRAY]);
  const [inputArr, setInputArr] = useState(DEFAULT_ARRAY.join(", "));
  const [target, setTarget] = useState("");
  const [current, setCurrent] = useState(-1);
  const [found, setFound] = useState(-1);
  const [notFound, setNotFound] = useState(false);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState(0);
  const [speed, setSpeed] = useState(600);
  const [done, setDone] = useState(false);
  const stopRef = useRef(false);

  const reset = () => {
    stopRef.current = true;
    setCurrent(-1);
    setFound(-1);
    setNotFound(false);
    setSteps(0);
    setDone(false);
    setRunning(false);
  };

  const applyArray = () => {
    const parsed = inputArr
      .split(",")
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n))
      .slice(0, 20);
    setArray(parsed);
    reset();
  };

  const randomArray = () => {
    const arr = Array.from({ length: 12 }, () => Math.floor(Math.random() * 99) + 1);
    setArray(arr);
    setInputArr(arr.join(", "));
    reset();
  };

  const runSearch = async () => {
    const t = parseInt(target);
    if (isNaN(t)) return;
    reset();
    await sleep(100);
    stopRef.current = false;
    setRunning(true);
    setNotFound(false);
    setFound(-1);
    setDone(false);

    for (let i = 0; i < array.length; i++) {
      if (stopRef.current) break;
      setCurrent(i);
      setSteps(i + 1);
      await sleep(speed);
      if (array[i] === t) {
        setFound(i);
        setDone(true);
        setRunning(false);
        return;
      }
    }

    if (!stopRef.current) {
      setCurrent(-1);
      setNotFound(true);
      setDone(true);
    }
    setRunning(false);
  };

  const maxVal = Math.max(...array, 1);

  const getBarClass = (i) => {
    if (found === i) return "ls-bar ls-bar--found";
    if (current === i) return "ls-bar ls-bar--current";
    if (done && found === -1) return "ls-bar ls-bar--fail";
    return "ls-bar";
  };

  return (
    <div className="ls-page">
      <div className="ls-description">
        <h2>Линейный поиск</h2>
        <p>
          Простейший алгоритм поиска: элементы проверяются по одному слева направо,
          пока не будет найден нужный или массив не закончится.
        </p>
        <div className="ls-legend">
          <span className="ls-legend-item ls-legend--current">Текущий</span>
          <span className="ls-legend-item ls-legend--found">Найден</span>
          <span className="ls-legend-item ls-legend--fail">Не найден</span>
        </div>
        <div className="ls-complexity">
          <span>Лучший случай: <strong>O(1)</strong></span>
          <span>Средний / Худший: <strong>O(n)</strong></span>
        </div>
      </div>

      <div className="ls-controls">
        <input
          className="ls-input"
          value={inputArr}
          onChange={(e) => setInputArr(e.target.value)}
          placeholder="Массив: 1, 2, 3 ..."
        />
        <button className="ls-btn ls-btn--secondary" onClick={applyArray} disabled={running}>
          Применить
        </button>
        <button className="ls-btn ls-btn--secondary" onClick={randomArray} disabled={running}>
          Случайный
        </button>
      </div>

      <div className="ls-controls">
        <input
          className="ls-input ls-input--short"
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Искомый элемент"
        />
        <label className="ls-speed-label">
          Скорость
          <input
            type="range"
            min={100}
            max={1500}
            step={100}
            value={1600 - speed}
            onChange={(e) => setSpeed(1600 - Number(e.target.value))}
          />
        </label>
        <button className="ls-btn ls-btn--primary" onClick={runSearch} disabled={running || target === ""}>
          {running ? "Идёт поиск..." : "Запустить"}
        </button>
        <button className="ls-btn ls-btn--secondary" onClick={reset} disabled={!running && !done}>
          Сбросить
        </button>
      </div>

      <div className="ls-chart-area">
        <div
          className="ls-bars"
          style={{ gridTemplateColumns: `repeat(${array.length}, 1fr)` }}
        >
          {array.map((val, i) => (
            <div key={i} className="ls-bar-wrap">
              <div
                className={getBarClass(i)}
                style={{ height: `${(val / maxVal) * 90}%` }}
              >
                <span className="ls-bar-label">{val}</span>
              </div>
              <span className="ls-bar-index">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {done && found >= 0 && (
        <div className="ls-notification ls-notification--success">
          ✅ Элемент <strong>{array[found]}</strong> найден на позиции <strong>{found}</strong>. Сделано шагов: {steps}
        </div>
      )}
      {done && notFound && (
        <div className="ls-notification ls-notification--error">
          ❌ Элемент <strong>{target}</strong> не найден. Просмотрено элементов: {steps}
        </div>
      )}
      {!done && steps > 0 && (
        <div className="ls-stats">Проверено элементов: {steps}</div>
      )}

      <div className="ls-nav">
        <button className="ls-btn ls-btn--secondary" onClick={() => window.history.back()}>
          ← Назад
        </button>
      </div>
    </div>
  );
};

export default LinearSearchPage;
