import React, { useEffect, useState } from "react";
import "./BubbleSortPage.css";

function getQuickSortSteps(arr) {
  const steps = [];
  let comparisons = 0;
  let swaps = 0;
  const array = [...arr];

  function quickSort(low, high) {
    if (low >= high) return;
    const pivotIndex = partition(low, high);
    quickSort(low, pivotIndex - 1);
    quickSort(pivotIndex + 1, high);
  }

  function partition(low, high) {
    const pivot = array[high];
    let i = low;

    steps.push({ arr: [...array], pivotIndex: high, current: null, comparing: null, swaps, comparisons, action: `Выбираем pivot ${pivot}` });

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({ arr: [...array], pivotIndex: high, current: j, comparing: [j], swaps, comparisons, action: `Сравниваем arr[${j}] = ${array[j]} с pivot = ${pivot}` });
      if (array[j] < pivot) {
        swaps++;
        [array[i], array[j]] = [array[j], array[i]];
        steps.push({ arr: [...array], pivotIndex: high, current: j, comparing: [i, j], swaps, comparisons, action: `Меняем arr[${i}] и arr[${j}]` });
        i++;
      }
    }

    swaps++;
    [array[i], array[high]] = [array[high], array[i]];
    steps.push({ arr: [...array], pivotIndex: i, current: i, comparing: [i, high], swaps, comparisons, action: `Размещаем pivot на позицию ${i}` });
    return i;
  }

  quickSort(0, array.length - 1);
  steps.push({ arr: [...array], pivotIndex: null, current: null, comparing: null, swaps, comparisons, action: "Сортировка завершена!", done: true });

  return steps;
}

const QuickSortPage = () => {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const [arraySize, setArraySize] = useState(10);
  const [minValue, setMinValue] = useState(5);
  const [maxValue, setMaxValue] = useState(100);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStepIndex((s) => s + 1), speed);
    return () => clearTimeout(timer);
  }, [playing, stepIndex, steps, speed]);

  const generateArray = () => {
    if (arraySize < 2 || minValue >= maxValue) {
      alert("Проверь параметры массива");
      return;
    }
    const arr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    );
    setSteps(getQuickSortSteps(arr));
    setStepIndex(0);
    setPlaying(false);
  };

  const current = steps[stepIndex] || {};
  const MAX_BAR_HEIGHT = 300;
  const maxValueInArray = current.arr?.length ? Math.max(...current.arr) : 1;

  // Инвертируем ползунок скорости
  const handleSpeedChange = (value) => {
    const minDelay = 50;
    const maxDelay = 1500;
    const newSpeed = maxDelay - ((value / 100) * (maxDelay - minDelay));
    setSpeed(newSpeed);
  };

  return (
    <div className="bubble-page">
      <h1>Quick Sort</h1>
      {/* ===== Описание алгоритма ===== */}
<div className="algorithm-description">
  <h2>Описание алгоритма</h2>
  <p>
    <strong>Быстрая сортировка (Quick Sort)</strong> — это эффективный алгоритм
    сортировки, который использует принцип «разделяй и властвуй».
  </p>
  <p>
    Алгоритм выбирает опорный элемент (pivot) из массива и разделяет все остальные
    элементы на две группы: меньшие и большие относительно опорного. Затем
    рекурсивно сортирует каждую из этих групп.
  </p>
  <p>
    Быстрая сортировка обычно работает очень быстро на больших массивах,
    особенно по сравнению с простыми алгоритмами, такими как пузырьковая сортировка.
  </p>
  <p><strong>Сложность:</strong> в среднем O(n log n), в худшем случае O(n²)</p>
</div>

        {/* ===== Настройки массива ===== */}
      <div className="array-controls">
        <div>
          <label>Размер</label>
          <input
            type="number"
            min="2"
            max="50"
            value={arraySize}
            onChange={(e) => setArraySize(+e.target.value)}
          />
        </div>
        <div>
          <label>Минимум</label>
          <input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(+e.target.value)}
          />
        </div>
        <div>
          <label>Максимум</label>
          <input
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(+e.target.value)}
          />
        </div>
      </div>
      {/* ===== Кнопки управления ===== */}
      <div className="controls">
        <button onClick={generateArray}>Создать массив</button>
        <button onClick={() => setPlaying((p) => !p)}>
          {playing ? "⏸ Пауза" : "▶️ Старт"}
        </button>
        <button onClick={() => setStepIndex(0)}>🔁 Сброс</button>

        <div className="speed-control">
          <label>Скорость</label>
          <input
            type="range"
            min="100"
            max="1500"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
        </div>
      </div>

      {/* Диаграмма */}
      <div className="chart-area">
        {current.arr && (
          <div className="bars" style={{ gridTemplateColumns: `repeat(${current.arr.length}, 1fr)` }}>
            {current.arr.map((v, i) => {
              const isPivot = current.pivotIndex === i;
              const isCurrent = current.current === i;
              const isComparing = current.comparing?.includes(i);
              const isDone = current.done;

              return (
                <div
                  key={i}
                  className={`bar
                    ${isPivot ? "bar-pivot" : ""}
                    ${isCurrent ? "bar-current" : ""}
                    ${isComparing ? "bar-compare" : ""}
                    ${isDone ? "bar-sorted" : ""}`}
                  style={{ height: `${(v / maxValueInArray) * MAX_BAR_HEIGHT}px` }}
                >
                  {v}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Статистика */}
      {steps.length > 0 && (
        <div className="stats">
          <p>Сравнения: {current.comparisons}</p>
          <p>Перестановки: {current.swaps}</p>
        </div>
      )}

      {/* Завершение */}
      {current.done && <div className="sorted-notification">✅ Массив отсортирован!</div>}
    </div>
  );
};

export default QuickSortPage;
