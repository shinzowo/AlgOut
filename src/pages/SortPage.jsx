import React from "react";
import Card from "../components/Card";
import "./SortPage.css";

const sortAlgorithms = [
  { title: "Bubble Sort",  link: "/bubble" },
  { title: "Selection Sort", link: "/selection" },
  { title: "Insertion Sort", link: "/insertion" },
  { title: "Merge Sort",  link: "/merge" },
  { title: "Quick Sort", link: "/quick" },
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
