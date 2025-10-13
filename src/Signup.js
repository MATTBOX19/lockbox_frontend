import React, { useState } from "react";
import axios from "axios";
import "./theme.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL || "https://lockbox-backend-qkx9.onrender.com";

export default function Signup({ onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/signup`, { email, password });
      localStorage.setItem("token", res.data.token);
      setSuccess("✅ Account created! You can now log in.");
      onSignup(res.data.user);
    } catch (err) {
      setError("Email already registered or invalid input");
    }
  };

  return (
    <div className="auth-container">
      <h2>🚀 Join LockBox AI</h2>
      <p className="subtitle">1-Day Free Trial Access</p>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleSignup}>Start Free Trial</button>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}
