import React, { useEffect, useState } from "react";
import "./InsertionSortPage.css";

/* =====================================
   Генерация шагов Insertion Sort
===================================== */
function getInsertionSortSteps(initialArr) {
  const arr = [...initialArr];
  const steps = [];
  let comparisons = 0;
  let shifts = 0;

  // Первый элемент считается отсортированным
  steps.push({
    arr: [...arr],
    sortedUntil: 1,
    keyIndex: null,
    compareIndex: null,
    comparisons,
    shifts,
  });

  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;

    // Показываем выбранный key
    steps.push({
      arr: [...arr],
      sortedUntil: i,
      keyIndex: i,
      compareIndex: j,
      comparisons,
      shifts,
    });

    while (j >= 0) {
      comparisons++;

      // Шаг сравнения
      steps.push({
        arr: [...arr],
        sortedUntil: i,
        keyIndex: i,
        compareIndex: j,
        comparisons,
        shifts,
      });

      if (arr[j] > key) {
        // Сдвиг элемента вправо
        arr[j + 1] = arr[j];
        shifts++;

        steps.push({
          arr: [...arr],
          sortedUntil: i,
          keyIndex: j,
          compareIndex: j - 1,
          comparisons,
          shifts,
        });

        j--;
      } else {
        break;
      }
    }

    // Вставка key на своё место
    arr[j + 1] = key;

    steps.push({
      arr: [...arr],
      sortedUntil: i + 1,
      keyIndex: null,
      compareIndex: null,
      comparisons,
      shifts,
    });
  }

  steps.push({
    arr: [...arr],
    sortedUntil: arr.length,
    keyIndex: null,
    compareIndex: null,
    comparisons,
    shifts,
    done: true,
  });

  return steps;
}

/* =====================================
   Компонент страницы
===================================== */
const InsertionSortPage = () => {
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

    setSteps(getInsertionSortSteps(arr));
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
    <div className="insertion-page">
      <h1>Insertion Sort</h1>

      {/* ===== Описание ===== */}
      <div className="algorithm-description">
        <h2>Описание алгоритма</h2>
        <p>
          <strong>Сортировка вставками (Insertion Sort)</strong> работает так же,
          как сортировка карт в руке.
        </p>
        <p>
          Алгоритм берёт очередной элемент (<strong>key</strong>) и вставляет его
          в правильное место в уже отсортированной части массива,
          сдвигая элементы вправо.
        </p>
        <p><strong>Сложность:</strong> O(n²), но очень эффективен для почти
        отсортированных массивов.</p>
      </div>

      {/* ===== Настройки массива ===== */}
      <div className="array-controls">
        <div>
          <label>Размер</label>
          <input type="number" min="2" max="50" value={arraySize}
            onChange={(e) => setArraySize(+e.target.value)} />
        </div>
        <div>
          <label>Минимум</label>
          <input type="number" value={minValue}
            onChange={(e) => setMinValue(+e.target.value)} />
        </div>
        <div>
          <label>Максимум</label>
          <input type="number" value={maxValue}
            onChange={(e) => setMaxValue(+e.target.value)} />
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
          <input type="range" min="100" max="1500" step="100"
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)} />
        </div>
      </div>

      {/* ===== Диаграмма ===== */}
      <div className="chart-area">
        {current.arr && (
          <div className="bars"
            style={{ gridTemplateColumns: `repeat(${current.arr.length}, 1fr)` }}>
            {current.arr.map((v, i) => {
              const isSorted = i < current.sortedUntil;
              const isKey = i === current.keyIndex;
              const isCompared = i === current.compareIndex;

              return (
                <div
                  key={i}
                  className={`bar
                    ${isSorted ? "bar-sorted" : ""}
                    ${isKey ? "bar-key" : ""}
                    ${isCompared ? "bar-compare" : ""}`}
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
          <p>Сдвиги: {current.shifts}</p>
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

export default InsertionSortPage;
