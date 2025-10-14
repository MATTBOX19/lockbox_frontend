import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("nfl");
  const [picks, setPicks] = useState([]);
  const [top3, setTop3] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  // ===== Fetch Picks =====
  const fetchPicks = async (sport) => {
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`${API_BASE}/api/picks/${sport}`);
      if (!res.ok) throw new Error("Failed to fetch picks");
      const data = await res.json();
      const all = data.picks || [];

      // Sort by confidence and take Top 3
      const sorted = [...all].sort(
        (a, b) => (b.moneyline?.confidence || 0) - (a.moneyline?.confidence || 0)
      );
      setTop3(sorted.slice(0, 3));
      setPicks(all);
    } catch (err) {
      console.error("❌ fetchPicks error:", err.message);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ===== Fetch Scores =====
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scores`);
      const data = await res.json();
      setScores(data.games || []);
    } catch (err) {
      console.error("❌ fetchScores error:", err.message);
      setScores([]);
    }
  };

  // ===== On Tab Change =====
  useEffect(() => {
    if (activeTab !== "scores") fetchPicks(activeTab);
    else fetchScores();
  }, [activeTab]);

  // ===== Tabs =====
  const renderTabs = () => (
    <div className="tabs">
      {["nfl", "mlb", "nhl", "ncaaf", "scores"].map((tab) => (
        <button
          key={tab}
          className={activeTab === tab ? "active" : ""}
          onClick={() => setActiveTab(tab)}
        >
          {tab === "scores" ? "📊 Scores" : tab.toUpperCase()}
        </button>
      ))}
    </div>
  );

  // ===== Top 3 Picks =====
  const renderTop3 = () => (
    <div className="top3-section">
      <h2>🔥 Top 3 AI Picks</h2>
      {top3.map((p, i) => (
        <div key={i} className="card highlight">
          <h3>{p.matchup}</h3>
          <p>Bookmaker: {p.bookmaker}</p>
          <p>
            <strong>ML:</strong> {p.moneyline?.pick} (
            {p.moneyline?.confidence}%)
          </p>
          {p.spread && (
            <p>
              <strong>Spread:</strong> {p.spread.pick} (
              {p.spread.confidence}%)
            </p>
          )}
        </div>
      ))}
    </div>
  );

  // ===== Weekly Model =====
  const renderWeeklyModel = () => (
    <div className="weekly-section">
      <h2>💎 LockBox AI Weekly Model</h2>
      <p className="section-sub">
        AI-powered confidence edges & recommendations
      </p>
      {picks.map((p, i) => (
        <div key={i} className="card">
          <h3>{p.matchup}</h3>
          <p>Bookmaker: {p.bookmaker}</p>
          <p>
            <strong>Moneyline Pick:</strong> {p.moneyline?.pick} (
            {p.moneyline?.confidence}%)
          </p>
          {p.spread && (
            <p>
              <strong>Spread Pick:</strong> {p.spread.pick} (
              {p.spread.confidence}%)
            </p>
          )}
        </div>
      ))}
    </div>
  );

  // ===== Scores =====
  const renderScores = () => (
    <div className="scores-section">
      <h2>🏈 Live & Recent Scores</h2>
      {scores.length === 0 ? (
        <p>No live or recent games.</p>
      ) : (
        scores.map((g, i) => (
          <div key={i} className="card">
            <h3>
              {g.away_team} @ {g.home_team}
            </h3>
            <p>
              {g.scores?.length > 0
                ? `${g.scores[0].name}: ${g.scores[0].score} | ${g.scores[1].name}: ${g.scores[1].score}`
                : "No score data"}
            </p>
            <p>{g.completed ? "✅ FINAL" : "⏱ LIVE"}</p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="App">
      <header className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <p className="subtitle">Smart AI Sports Analysis</p>
      </header>

      {renderTabs()}

      <div className="content">
        {activeTab === "scores" ? (
          renderScores()
        ) : (
          <>
            {renderTop3()}
            {renderWeeklyModel()}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
