import React from "react";
import Card from "../components/Card";
import "./SearchPage.css";

const searchAlgorithms = [
  { title: "Линейный поиск", link: "/linear-search" },
  { title: "Бинарный поиск", link: "/binary-search" },
];

const SearchPage = () => {
  return (
    <div className="search-page">
      <h1 className="search-title">Алгоритмы поиска</h1>
      <div className="search-grid">
        {searchAlgorithms.map((algo, index) => (
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

export default SearchPage;
