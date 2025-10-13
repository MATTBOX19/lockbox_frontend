import React, { useState } from "react";
import axios from "axios";
import "./theme.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://lockbox-backend-qkx9.onrender.com";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="auth-container">
      <h2>🔐 LockBox Login</h2>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      {error && <p className="error">{error}</p>}
      <p className="hint">New here? Sign up for a 1-Day Free Trial →</p>
    </div>
  );
}
