import React from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-left">AlgOut</div>
      <div className="header-right">
        <button className="login-button" onClick={handleLogin}>
          Войти
        </button>
      </div>
    </header>
  );
};

export default Header;


