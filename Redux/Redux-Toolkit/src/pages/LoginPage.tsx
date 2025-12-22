import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import "./LoginPage.css";
import { selectIsAuthenticated } from "../features/auth/authSelectors";
import { login } from "../features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      dispatch(
        login({
          id: Date.now(),
          username,
          email: `${username}@example.com`,
          name: username,
        })
      );
      navigate("/");
    } else {
      setError("Vui lòng nhập đầy đủ thông tin");
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>News Reader</h1>
          <p>Đăng nhập để đọc tin tức</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>

          <button type="submit" className="login-button">
            Đăng nhập
          </button>

          <div className="login-footer">
            <p>Demo: Nhập bất kỳ username/password để tiếp tục</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
