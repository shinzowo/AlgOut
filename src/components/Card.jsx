import React from "react";
import "./Card.css";

const Card = ({ title, icon, link }) => {
  const handleClick = () => {
    window.location.href = link;
  };

  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>

      {/* отображаем иконку только если она передана */}
      {icon && <img src={icon} alt={title} className="card-icon" />}

      <button className="card-button" onClick={handleClick}>
        Изучить
      </button>
    </div>
  );
};

export default Card;
