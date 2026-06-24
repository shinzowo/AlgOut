import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { loginUser, registerUser } from "../api";

const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // не перезагружать страницу
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const data = await loginUser(username, password);
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user_id", data.user_id);
          navigate("/");
        } else {
          setError(data.detail || "Неверный логин или пароль");
        }

      } else {
        // Регистрация
        const data = await registerUser(username, email, password);
        if (data.user_id) {
          // После регистрации сразу входим
          const login = await loginUser(username, password);
          if (login.access_token) {
            localStorage.setItem("token", login.access_token);
            localStorage.setItem("user_id", login.user_id);
            navigate("/");
          }
        } else {
          setError(data.detail || "Ошибка регистрации");
        }
      }
    } catch (err) {
      setError("Сервер недоступен. Убедитесь, что бэкенд запущен на порту 8000.");
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-form">
        {/* Переключатель */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === "login" ? "login-tab--active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
            type="button"
          >
            Вход
          </button>
          <button
            className={`login-tab ${mode === "register" ? "login-tab--active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
            type="button"
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {mode === "register" && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          )}

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
