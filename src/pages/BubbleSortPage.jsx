import React, { useEffect, useState } from "react";
import "./BubbleSortPage.css";

/* ===============================
   Генерация шагов Bubble Sort
================================ */
function getBubbleSortSteps(initialArr) {
  const arr = [...initialArr];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      comparisons++;

      steps.push({
        arr: [...arr],
        compare: [j, j + 1],
        sortedFrom: arr.length - i,
        comparisons,
        swaps,
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swaps++;

        steps.push({
          arr: [...arr],
          compare: [j, j + 1],
          sortedFrom: arr.length - i,
          comparisons,
          swaps,
        });
      }
    }
  }

  steps.push({
    arr: [...arr],
    compare: null,
    sortedFrom: 0,
    comparisons,
    swaps,
    done: true,
  });

  return steps;
}

/* ===============================
   Компонент страницы
================================ */
const BubbleSortPage = () => {
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);

  const [arraySize, setArraySize] = useState(10);
  const [minValue, setMinValue] = useState(5);
  const [maxValue, setMaxValue] = useState(100);

  /* ===== Автопроигрывание ===== */
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setStepIndex((s) => s + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [playing, stepIndex, steps, speed]);

  /* ===== Генерация массива ===== */
  const generateArray = () => {
    if (arraySize < 2 || minValue >= maxValue) {
      alert("Проверь параметры массива");
      return;
    }

    const arr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    );

    const newSteps = getBubbleSortSteps(arr);
    setSteps(newSteps);
    setStepIndex(0);
    setPlaying(false);
  };

  const current = steps[stepIndex] || {};

  return (
    <div className="bubble-page">
      <h1>Bubble Sort</h1>

      {/* ===== Описание алгоритма ===== */}
      <div className="algorithm-description">
        <h2>Описание алгоритма</h2>
        <p>
          <strong>Пузырьковая сортировка</strong> — простой алгоритм сортировки,
          который многократно проходит по массиву, сравнивая соседние элементы и
          меняя их местами, если они стоят в неправильном порядке.
        </p>
        <p>
          После каждого прохода самый большой элемент «всплывает» в конец массива.
        </p>
        <p><strong>Сложность:</strong> O(n²)</p>
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

      {/* ===== Диаграмма ===== */}
      <div className="chart-area">
        {current.arr && (
          <div
            className="bars"
            style={{
              gridTemplateColumns: `repeat(${current.arr.length}, 1fr)`,
            }}
          >
            {current.arr.map((v, i) => {
              const isCompared = current.compare?.includes(i);
              const isSorted = i >= current.sortedFrom;
              
              const MAX_BAR_HEIGHT = 300;

              const maxValueInArray =
              current.arr && current.arr.length > 0
              ? Math.max(...current.arr)
              : 1;
              return (
                <div
                  key={i}
                  className={`bar 
                    ${isCompared ? "bar-compare" : ""} 
                    ${isSorted ? "bar-sorted" : ""}`}
                  style={{
                  height: `${(v / maxValueInArray) * MAX_BAR_HEIGHT}px`,
                  }}
                >
                  {v}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== Статистика ===== */}
      {steps.length > 0 && (
        <div className="stats">
          <p>Сравнения: {current.comparisons}</p>
          <p>Перестановки: {current.swaps}</p>
        </div>
      )}

      {/* ===== Завершение ===== */}
      {current.done && (
        <div className="sorted-notification">
          ✅ Массив отсортирован
        </div>
      )}
    </div>
  );
};

export default BubbleSortPage;
