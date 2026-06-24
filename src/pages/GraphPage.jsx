import React from "react";
import Card from "../components/Card";
import "./GraphPage.css";

const graphAlgorithms = [
  { title: "Обход в ширину (BFS)",  link: "/bfs"      },
  { title: "Обход в глубину (DFS)", link: "/dfs"      },
  { title: "Алгоритм Дейкстры",     link: "/dijkstra" },
  { title: "Алгоритм A*",           link: "/astar"    },
];

const GraphPage = () => (
  <div className="graph-page">
    <h1 className="graph-title">Алгоритмы на графах</h1>
    <div className="graph-grid">
      {graphAlgorithms.map((item, i) => (
        <Card key={i} title={item.title} link={item.link} />
      ))}
    </div>
  </div>
);

export default GraphPage;
