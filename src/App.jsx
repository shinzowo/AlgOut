import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Card from "./components/Card";
import LoginPage from "./pages/LoginPage";
import sortIcon   from "./assets/sort-icon.svg";
import loupeIcon  from "./assets/loupe-icon.svg";
import structIcon from "./assets/struct-icon.svg";
import graphIcon  from "./assets/graph-icon.svg";
import "./App.css";

// Sort
import SortPage        from "./pages/SortPage";
import BubbleSortPage  from "./pages/BubbleSortPage";
import SelectionSortPage from "./pages/SelectionSortPage";
import InsertionSortPage from "./pages/InsertionSortPage";
import MergeSortPage   from "./pages/MergeSortPage";
import QuickSortPage   from "./pages/QuickSortPage";

// Search
import SearchPage       from "./pages/SearchPage";
import BinarySearchPage from "./pages/BinarySearchPage";
import LinearSearchPage from "./pages/LinearSearchPage";

// Structures
import HashTablePage from "./pages/HashTablePage";

// Graphs
import GraphPage    from "./pages/GraphPage";
import BFSPage      from "./pages/BFSPage";
import DFSPage      from "./pages/DFSPage";
import DijkstraPage from "./pages/DijkstraPage";
import AStarPage    from "./pages/AStarPage";

const cardsData = [
  { title: "Сортировка",        icon: sortIcon,   link: "/algo1" },
  { title: "Поиск",             icon: loupeIcon,  link: "/algo2" },
  { title: "Структуры данных",  icon: structIcon, link: "/algo3" },
  { title: "Графы",             icon: graphIcon,  link: "/algo4" },
];

const App = () => (
  <Router>
    <Header />
    <Routes>
      {/* Home */}
      <Route path="/" element={
        <div className="cards-grid">
          {cardsData.map((card, i) => (
            <Card key={i} title={card.title} icon={card.icon} link={card.link} />
          ))}
        </div>
      }/>

      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Sort */}
      <Route path="/algo1"     element={<SortPage />} />
      <Route path="/bubble"    element={<BubbleSortPage />} />
      <Route path="/selection" element={<SelectionSortPage />} />
      <Route path="/insertion" element={<InsertionSortPage />} />
      <Route path="/merge"     element={<MergeSortPage />} />
      <Route path="/quick"     element={<QuickSortPage />} />

      {/* Search */}
      <Route path="/algo2"         element={<SearchPage />} />
      <Route path="/binary-search" element={<BinarySearchPage />} />
      <Route path="/linear-search" element={<LinearSearchPage />} />

      {/* Structures */}
      <Route path="/algo3"      element={<HashTablePage />} />
      <Route path="/hash-table" element={<HashTablePage />} />

      {/* Graphs */}
      <Route path="/algo4"    element={<GraphPage />} />
      <Route path="/bfs"      element={<BFSPage />} />
      <Route path="/dfs"      element={<DFSPage />} />
      <Route path="/dijkstra" element={<DijkstraPage />} />
      <Route path="/astar"    element={<AStarPage />} />
    </Routes>
  </Router>
);

export default App;
