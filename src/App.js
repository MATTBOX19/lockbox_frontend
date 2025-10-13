import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const API_BASE = process.env.REACT_APP_API_BASE || "https://lockbox-backend.onrender.com";
  const [featured, setFeatured] = useState(null);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featRes, recordRes] = await Promise.all([
        fetch(`${API_BASE}/api/featured`),
        fetch(`${API_BASE}/api/record`),
      ]);
      const featData = await featRes.json();
      const recData = await recordRes.json();
      setFeatured(featData);
      setRecord(recData);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <h2>🔒 LockBox AI Loading Picks...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>🏈 LockBox AI Picks</h1>
        <p className="record">
          Record: {record.wins}-{record.losses} | Accuracy:{" "}
          <strong>{record.winRate}%</strong>
        </p>
      </header>

      {!featured ? (
        <div className="no-data">No data available yet</div>
      ) : (
        <div className="picks-container">
          <PickCard
            title="💰 Moneyline Lock"
            pick={featured.moneylineLock}
            color="#00FF9C"
          />
          <PickCard
            title="🧱 Spread Lock"
            pick={featured.spreadLock}
            color="#39B5FF"
          />
          <PickCard
            title="🎯 Prop Lock"
            pick={featured.propLock}
            color="#FFA84D"
          />
        </div>
      )}

      <footer>
        <p>
          Updated:{" "}
          {featured?.generatedAt
            ? new Date(featured.generatedAt).toLocaleString()
            : "n/a"}
        </p>
      </footer>
    </div>
  );
}

function PickCard({ title, pick, color }) {
  if (!pick) return null;
  return (
    <div className="pick-card" style={{ borderColor: color }}>
      <h2 style={{ color }}>{title}</h2>
      {pick.player ? (
        <p>
          <strong>{pick.player}</strong> ({pick.market})<br />
          Odds: {pick.price} | Confidence: {pick.confidence}%
        </p>
      ) : (
        <>
          <p>
            <strong>{pick.pick}</strong>
          </p>
          <p>Confidence: {pick.confidence}%</p>
          {pick.homeML && <p>Home ML: {pick.homeML}</p>}
          {pick.awayML && <p>Away ML: {pick.awayML}</p>}
        </>
      )}
    </div>
  );
}

export default App;
