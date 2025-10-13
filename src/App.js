import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [featured, setFeatured] = useState(null);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  const fetchData = async () => {
    try {
      setError(false);
      setLoading(true);
      const [featuredRes, recordRes] = await Promise.all([
        fetch(`${API_BASE}/api/featured`),
        fetch(`${API_BASE}/api/record`),
      ]);

      if (!featuredRes.ok || !recordRes.ok)
        throw new Error("Server connection failed");

      const featuredData = await featuredRes.json();
      const recordData = await recordRes.json();

      setFeatured(featuredData);
      setRecord(recordData);
    } catch (err) {
      console.error("❌ LockBox AI fetch error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // auto refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>💎 LOCKBOX AI</h1>
      <p>Win Smarter. Not Harder.</p>

      <div className="record">
        <p>
          🔥 Record: {record.wins}-{record.losses} ({record.winRate || 0}%)
        </p>
      </div>

      {error && (
        <p className="error">Could not connect to LockBox AI server.</p>
      )}

      {loading && <p>Loading picks...</p>}

      {featured && !loading && (
        <>
          <div className="locks-section">
            <h2>🏆 LockBox Picks of the Day</h2>
            <div className="locks">
              <div className="lock-card">
                <h3>💰 Moneyline Lock</h3>
                <p>{featured.moneylineLock?.pick || "—"}</p>
                <p>Confidence: {featured.moneylineLock?.confidence || 0}%</p>
              </div>

              <div className="lock-card">
                <h3>📏 Spread Lock</h3>
                <p>{featured.spreadLock?.pick || "—"}</p>
                <p>Confidence: {featured.spreadLock?.confidence || 0}%</p>
              </div>

              <div className="lock-card">
                <h3>🎯 Prop Lock</h3>
                <p>{featured.propLock?.player || "No props available"}</p>
                <p>Confidence: {featured.propLock?.confidence || 0}%</p>
              </div>
            </div>
          </div>

          <div className="all-picks">
            <h2>🤖 All AI Game Picks</h2>
            {featured.picks.map
