import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header";
import Card from "./components/Card";
import LoginPage from "./pages/LoginPage";
import sortIcon from "./assets/sort-icon.svg"; 
import loupeIcon from "./assets/loupe-icon.svg"; 
import structIcon from "./assets/struct-icon.svg"; 
import graphIcon from "./assets/graph-icon.svg"; 
import "./App.css"
import SortPage from "./pages/SortPage";
import BubbleSortPage from "./pages/BubbleSortPage";
import SelectionSortPage from "./pages/SelectionSortPage";
import InsertionSortPage from "./pages/InsertionSortPage";
import MergeSortPage from "./pages/MergeSortPage";
import QuickSortPage from "./pages/QuickSortPage";
import SearchPage from "./pages/SearchPage";
import BinarySearchPage from "./pages/BinarySearchPage";

const cardsData = [
  { title: "Сортировка", icon: sortIcon, link: "/algo1" },
  { title: "Поиск", icon: loupeIcon, link: "/algo2" },
  { title: "Структура данных", icon: structIcon, link: "/algo3" },
  { title: "Графы", icon: graphIcon, link: "/algo4" },
  // добавь другие карточки
];


const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={
          <div className="cards-grid">
            {cardsData.map((card, index) => (
              <Card key={index} title={card.title} icon={card.icon} link={card.link} />
            ))}
          </div>
        }/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/algo1" element={<SortPage />} />
          <Route path="/bubble" element={<BubbleSortPage />} />
          <Route path="/selection" element={<SelectionSortPage />} />
          <Route path="/insertion" element={<InsertionSortPage />} />
          <Route path="/merge" element={<MergeSortPage />} />
          <Route path="/quick" element={<QuickSortPage />} />
        <Route path="/algo2" element={<SearchPage />} />
          <Route path="/binary-search" element={<BinarySearchPage />} />
        
      </Routes>
    </Router>
  );
};

export default App;





