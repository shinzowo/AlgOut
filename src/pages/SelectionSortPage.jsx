import React, { useEffect, useState } from "react";
import "./SelectionSortPage.css";

/* ===============================
   Генерация шагов Selection Sort
================================ */
function getSelectionSortSteps(initialArr) {
  const arr = [...initialArr];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < arr.length; i++) {
    let minIndex = i;

    // Добавляем начальное состояние поиска
    steps.push({
      arr: [...arr],
      current: null,
      minIndex: minIndex, // Показываем начальный минимум
      sortedUntil: i,
      comparisons,
      swaps,
      message: `Начинаем поиск минимального элемента, начиная с индекса ${i}`
    });

    for (let j = i + 1; j < arr.length; j++) {
      // Показываем текущий сравниваемый элемент
      steps.push({
        arr: [...arr],
        current: j,
        minIndex: minIndex,
        sortedUntil: i,
        comparisons: comparisons + 1, // Увеличиваем заранее для отображения
        swaps,
        message: `Сравниваем arr[${j}] = ${arr[j]} с текущим минимумом arr[${minIndex}] = ${arr[minIndex]}`
      });

      comparisons++;

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
        // Добавляем шаг с обновленным минимумом
        steps.push({
          arr: [...arr],
          current: j,
          minIndex: minIndex,
          sortedUntil: i,
          comparisons,
          swaps,
          message: `Найден новый минимум! arr[${j}] = ${arr[j]}`
        });
      }
    }

    // Если нашли новый минимум, показываем обмен
    if (minIndex !== i) {
      // Шаг перед обменом
      steps.push({
        arr: [...arr],
        current: null,
        minIndex: minIndex,
        sortedUntil: i,
        comparisons,
        swaps,
        message: `Меняем местами arr[${i}] = ${arr[i]} с найденным минимумом arr[${minIndex}] = ${arr[minIndex]}`
      });

      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      swaps++;

      // Шаг после обмена
      steps.push({
        arr: [...arr],
        current: null,
        minIndex: null,
        sortedUntil: i + 1,
        comparisons,
        swaps,
        message: `Элементы поменяны местами. Отсортированная часть увеличилась`
      });
    } else {
      // Если минимум не изменился (уже на своем месте)
      steps.push({
        arr: [...arr],
        current: null,
        minIndex: null,
        sortedUntil: i + 1,
        comparisons,
        swaps,
        message: `Минимальный элемент уже на правильной позиции ${i}`
      });
    }
  }

  // Финальный шаг
  steps.push({
    arr: [...arr],
    current: null,
    minIndex: null,
    sortedUntil: arr.length,
    comparisons,
    swaps,
    done: true,
    message: 'Массив полностью отсортирован!'
  });

  return steps;
}

/* ===============================
   Компонент страницы
================================ */
const SelectionSortPage = () => {
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

    setSteps(getSelectionSortSteps(arr));
    setStepIndex(0);
    setPlaying(false);
  };

  const current = steps[stepIndex] || {};
  const MAX_BAR_HEIGHT = 300;

  const maxValueInArray =
    current.arr && current.arr.length > 0
      ? Math.max(...current.arr)
      : 1;

  return (
    <div className="selection-page">
      <h1>Selection Sort</h1>

      {/* ===== Описание ===== */}
      <div className="algorithm-description">
        <h2>Описание алгоритма</h2>
        <p>
          <strong>Сортировка выбором (Selection Sort)</strong> — алгоритм,
          который на каждом шаге находит минимальный элемент в неотсортированной
          части массива и меняет его местами с первым неотсортированным элементом.
        </p>
        <p>
          После каждого шага отсортированная часть массива увеличивается слева.
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

      {/* ===== Управление ===== */}
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
              const isSorted = i < current.sortedUntil;
              const isMin = i === current.minIndex;
              const isCurrent = i === current.current;

              return (
                <div
                  key={i}
                  className={`bar
                    ${isSorted ? "bar-sorted" : ""}
                    ${isMin ? "bar-min" : ""}
                    ${isCurrent ? "bar-current" : ""}`}
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

export default SelectionSortPage;
