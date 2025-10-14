import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("picks");
  const [featured, setFeatured] = useState(null);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_BASE_URL ||
    "https://lockbox-backend-qkx9.onrender.com";

  // Fetch picks and record
  const fetchMainData = async () => {
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

  // Fetch live scores
  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/scores`);
      const data = await res.json();
      const games = data.games || [];

      // Sort LIVE first, then finals
      const sorted = [
        ...games.filter((g) => !g.completed),
        ...games.filter((g) => g.completed),
      ];
      setScores(sorted);
    } catch (err) {
      console.error("❌ /api/scores error:", err.message);
      setScores([]);
    }
  };

  // Run once on load
  useEffect(() => {
    fetchMainData();
    fetchScores();
    const interval = setInterval(fetchScores, 60000); // auto-refresh every 1 min
    return () => clearInterval(interval);
  }, []);

  // ======================
  // 🧭 TAB NAVIGATION
  // ======================
  const renderTabs = () => (
    <div className="tabs">
      <button
        className={activeTab === "picks" ? "active" : ""}
        onClick={() => setActiveTab("picks")}
      >
        🧠 Picks
      </button>
      <button
        className={activeTab === "scores" ? "active" : ""}
        onClick={() => setActiveTab("scores")}
      >
        🏈 Scores
      </button>
    </div>
  );

  // ======================
  // 📊 PICKS TAB
  // ======================
  const renderPicks = () => (
    <>
      <div className="record">
        <p>
          🔥 Record: {record.wins}-{record.losses} ({record.winRate || 0}%)
        </p>
      </div>

      {error && <p className="error">Could not connect to LockBox AI server.</p>}
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
            {featured.picks && featured.picks.length > 0 ? (
              featured.picks.map((p, i) => (
                <div key={i} className="pick-card">
                  <h3>{p.matchup}</h3>
                  <p>Book: {p.bookmaker}</p>
                  <p>
                    <strong>AI Moneyline:</strong> {p.mlPick.pick} (
                    {p.mlPick.confidence}%)
                  </p>
                  {p.spreadPick && (
                    <p>
                      <strong>AI Spread:</strong> {p.spreadPick.pick} (
                      {p.spreadPick.confidence}%)
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No game picks available yet.</p>
            )}
          </div>
        </>
      )}
    </>
  );

  // ======================
  // 🏈 SCORES TAB
  // ======================
  const renderScores = () => (
    <div className="scores-section">
      <h2>🏈 Live & Recent NFL Scores</h2>
      {scores.length === 0 ? (
        <p>No live or recent games available.</p>
      ) : (
        scores.map((g, i) => (
          <div key={i} className="score-card">
            <h3>
              {g.away_team} @ {g.home_team}
            </h3>
            <p>
              {g.scores?.length > 0
                ? `${g.scores[0].name}: ${g.scores[0].score} | ${g.scores[1].name}: ${g.scores[1].score}`
                : "No score data"}
            </p>
            <p className={g.completed ? "final" : "live"}>
              {g.completed ? "✅ FINAL" : "⏱ LIVE"} |{" "}
              {new Date(g.last_update).toLocaleTimeString()}
            </p>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="App">
      <div className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <p className="subtitle">Win Smarter. Not Harder.</p>
      </div>
      {renderTabs()}
      {activeTab === "picks" ? renderPicks() : renderScores()}
    </div>
  );
}

export default App;
