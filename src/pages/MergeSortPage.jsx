import React, { useEffect, useState } from "react";
import "./MergeSortPage.css";

/* =====================================
   Генерация шагов Merge Sort (наглядно)
===================================== */
function getMergeSortSteps(initialArr) {
  const arr = [...initialArr];
  const steps = [];

  function mergeSort(l, r) {
    if (l >= r) return;

    const m = Math.floor((l + r) / 2);

    // Показываем деление
    steps.push({
      arr: [...arr],
      range: [l, r],
      mid: m,
      action: "split",
    });

    mergeSort(l, m);
    mergeSort(m + 1, r);
    merge(l, m, r);
  }

  function merge(l, m, r) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    const temp = [];

    while (i < left.length && j < right.length) {
      steps.push({
        arr: [...arr],
        range: [l, r],
        compare: [l + i, m + 1 + j],
        temp: [...temp],
        action: "compare",
      });

      if (left[i] <= right[j]) {
        temp.push(left[i++]);
      } else {
        temp.push(right[j++]);
      }
    }

    while (i < left.length) temp.push(left[i++]);
    while (j < right.length) temp.push(right[j++]);

    // Запись обратно в основной массив
    for (let t = 0; t < temp.length; t++) {
      arr[l + t] = temp[t];

      steps.push({
        arr: [...arr],
        range: [l, r],
        temp: [...temp.slice(0, t + 1)],
        writeIndex: l + t,
        action: "write",
      });
    }
  }

  mergeSort(0, arr.length - 1);

  steps.push({
    arr: [...arr],
    action: "done",
  });

  return steps;
}

/* =====================================
   Компонент страницы
===================================== */
const MergeSortPage = () => {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);

  const [arraySize, setArraySize] = useState(8);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }

    const t = setTimeout(() => {
      setStepIndex((s) => s + 1);
    }, speed);

    return () => clearTimeout(t);
  }, [playing, stepIndex, steps, speed]);

  const generateArray = () => {
    const arr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 100) + 10
    );
    setSteps(getMergeSortSteps(arr));
    setStepIndex(0);
    setPlaying(false);
  };

  const current = steps[stepIndex] || {};
  const MAX_BAR_HEIGHT = 260;
  const maxValue = current.arr ? Math.max(...current.arr) : 1;

  return (
    <div className="merge-page">
      <h1>Merge Sort</h1>

      {/* ===== Описание ===== */}
    {/* ===== Описание алгоритма ===== */}
<div className="algorithm-description">
  <h2>Как работает сортировка слиянием</h2>
  
  <p>
    <strong>Шаг 1: Разделение</strong><br/>
    Алгоритм рекурсивно делит массив пополам до тех пор, пока не останутся отдельные элементы или пустые подмассивы.
  </p>
  
  <p>
    <strong>Шаг 2: Сортировка и слияние</strong><br/>
    Начиная с самых мелких частей, алгоритм сращивает соседние подмассивы, сравнивая их элементы по одному и всегда выбирая наименьший из двух.
  </p>
  
  <p>
    <strong>Ключевой принцип</strong><br/>
    В отличие от "пузырьковой" сортировки, которая меняет элементы местами в исходном массиве, Merge Sort работает по принципу "разделяй и властвуй" — 
    он создает новые упорядоченные последовательности, сливая отсортированные части.
  </p>
  
  <p><strong>Сложность:</strong> O(n log n) — значительно эффективнее для больших массивов.</p>
</div>

      {/* ===== Управление ===== */}
      <div className="controls">
        <button onClick={generateArray}>Создать массив</button>
        <button onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Пауза" : "▶️ Старт"}
        </button>
        <button onClick={() => setStepIndex(0)}>🔁 Сброс</button>

        <input
          type="range"
          min="200"
          max="1500"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(+e.target.value)}
        />
      </div>

      {/* ===== Основной массив ===== */}
      <div className="chart-area">
        <div
          className="bars"
          style={{ gridTemplateColumns: `repeat(${current.arr?.length || 0}, 1fr)` }}
        >
          {current.arr?.map((v, i) => {
            const inRange =
              current.range && i >= current.range[0] && i <= current.range[1];
            const isCompared = current.compare?.includes(i);
            const isWritten = current.writeIndex === i;

            return (
              <div
                key={i}
                className={`bar
                  ${inRange ? "bar-range" : ""}
                  ${isCompared ? "bar-compare" : ""}
                  ${isWritten ? "bar-write" : ""}`}
                style={{
                  height: `${(v / maxValue) * MAX_BAR_HEIGHT}px`,
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Временный массив ===== */}
      {current.temp && (
        <div className="temp-array">
          <h4>Временный массив (merge buffer)</h4>
          <div className="temp-bars">
            {current.temp.map((v, i) => (
              <div key={i} className="temp-bar">
                {v}
              </div>
            ))}
          </div>
        </div>
      )}

      {current.action === "done" && (
        <div className="sorted-notification">
          ✅ Массив отсортирован
        </div>
      )}
    </div>
  );
};

export default MergeSortPage;
