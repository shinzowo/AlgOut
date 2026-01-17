import React, { useEffect, useState } from "react";
import styles from "./BinarySearchPage.module.css"; // Измененный импорт

/* ===============================
   Binary Search steps
================================ */
function getBinarySearchSteps(arr, target) {
  const steps = [];
  let left = 0;
  let right = arr.length - 1;
  let comparisons = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    comparisons++;

    steps.push({
      left,
      right,
      mid,
      comparisons,
    });

    if (arr[mid] === target) {
      steps.push({
        left,
        right,
        mid,
        comparisons,
        found: true,
      });
      return steps;
    }

    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  steps.push({
    comparisons,
    notFound: true,
  });

  return steps;
}

/* ===============================
   Page
================================ */
const BinarySearchPage = () => {
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(15);
  const [minValue, setMinValue] = useState(5);
  const [maxValue, setMaxValue] = useState(100);
  const [target, setTarget] = useState("");
  const [steps, setSteps] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);

  /* ===== autoplay ===== */
  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }

    const MIN_DELAY = 50;
    const MAX_DELAY = 1500;

    const delay = MAX_DELAY - speed + MIN_DELAY;

    const timer = setTimeout(() => {
      setStepIndex((i) => i + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [playing, stepIndex, steps, speed]);

  /* ===== generate sorted array ===== */
  const generateArray = () => {
    if (arraySize < 1 || minValue >= maxValue) {
      alert("Проверь параметры массива");
      return;
    }

    const arr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    ).sort((a, b) => a - b);

    setArray(arr);
    setSteps([]);
    setStepIndex(0);
    setPlaying(false);
  };

  /* ===== start search ===== */
  const startSearch = () => {
    if (!array.length) {
      alert("Сначала создайте массив");
      return;
    }
    if (target === "") {
      alert("Введите искомое значение");
      return;
    }

    const newSteps = getBinarySearchSteps(array, Number(target));
    setSteps(newSteps);
    setStepIndex(0);
    setPlaying(false);
  };

  const current = steps[stepIndex] || {};
  const maxValueInArray = array.length ? Math.max(...array) : 1;
  const MAX_BAR_HEIGHT = 300;

  return (
    <div className={styles.binaryPage}>
      <h1>Binary Search</h1>

      {/* ===== Controls ===== */}
      <div className={styles.arrayControls}>
        <input 
          type="number" 
          value={arraySize} 
          onChange={(e) => setArraySize(+e.target.value)} 
        />
        <input 
          type="number" 
          value={minValue} 
          onChange={(e) => setMinValue(+e.target.value)} 
        />
        <input 
          type="number" 
          value={maxValue} 
          onChange={(e) => setMaxValue(+e.target.value)} 
        />
        <button className={styles.binaryButton} onClick={generateArray}>
          Создать массив
        </button>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          placeholder="Искомое значение"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <button className={styles.binaryButton} onClick={startSearch}>
          🔍 Поиск
        </button>
        <button 
          className={styles.binaryButton} 
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "⏸ Пауза" : "▶️ Старт"}
        </button>
        <button 
          className={styles.binaryButton} 
          onClick={() => setStepIndex(0)}
        >
          🔁 Сброс
        </button>

        <div className={styles.speedControl}>
          <label>Скорость</label>
          <input
            type="range"
            min="200"
            max="1500"
            step="100"
            value={speed}
            onChange={(e) => setSpeed(+e.target.value)}
          />
        </div>
      </div>

      {/* ===== Visualization ===== */}
      <div className={styles.chartArea}>
        <div
          className={styles.bars}
          style={{ gridTemplateColumns: `repeat(${array.length}, 1fr)` }}
        >
          {array.map((v, i) => {
            const isMid = i === current.mid;
            const inRange =
              current.left !== undefined &&
              i >= current.left &&
              i <= current.right;

            const isOut =
              steps.length &&
              current.left !== undefined &&
              (i < current.left || i > current.right);

            // Собираем классы
            const barClasses = [
              styles.bar,
              isMid ? styles.barMid : "",
              inRange ? styles.barActive : "",
              isOut ? styles.barOut : "",
              current.found && isMid ? styles.barFound : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <div
                key={i}
                className={barClasses}
                style={{
                  height: `${(v / maxValueInArray) * MAX_BAR_HEIGHT}px`,
                }}
              >
                {v}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Result ===== */}
      {current.found && (
        <div className={styles.sortedNotification}>
          ✅ Элемент найден (индекс {current.mid})
        </div>
      )}

      {current.notFound && (
        <div className={`${styles.sortedNotification} ${styles.error}`}>
          ❌ Элемент не найден
        </div>
      )}
    </div>
  );
};

export default BinarySearchPage;