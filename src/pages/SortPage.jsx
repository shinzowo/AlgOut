import React from "react";
import Card from "../components/Card";
import "./SortPage.css";

const sortAlgorithms = [
  { title: "Сортировка пузырьком",  link: "/bubble" },
  { title: "Сортировка выбором", link: "/selection" },
  { title: "Сортировка вставками", link: "/insertion" },
  { title: "Сортировка слиянием",  link: "/merge" },
  { title: "Быстрая сортировка", link: "/quick" },
];

const SortPage = () => {
  return (
    <div className="sort-page">
      <h1 className="sort-title">Алгоритмы сортировки</h1>
      <div className="sort-grid">
        {sortAlgorithms.map((algo, index) => (
          <Card
            key={index}
            title={algo.title}
            icon={algo.icon}
            link={algo.link}
          />
        ))}
      </div>
    </div>
  );
};

export default SortPage;
