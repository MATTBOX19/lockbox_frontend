// src/App.js
import React, { useEffect, useState } from "react";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE;

function App() {
  const [featured, setFeatured] = useState(null);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setError(null);
      const [featuredRes, recordRes] = await Promise.all([
        fetch(`${API_BASE}/api/featured`).then((r) => r.json()),
        fetch(`${API_BASE}/api/record`).then((r) => r.json()),
      ]);
      setFeatured(featuredRes);
      setRecord(recordRes);
      setLoading(false);
    } catch (err) {
      console.error("Frontend fetch error:", err);
      setError("Could not connect to LockBox AI server.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const accuracy =
    record.wins + record.losses > 0
      ? ((record.wins / (record.wins + record.losses)) * 100).toFixed(1)
      : 0;

  return (
    <div className="App">
      <h1>💎 LOCKBOX AI</h1>
      <p className="subtitle">Win Smarter. Not Harder.</p>

      <p className="record">
        🔥 Record: {record.wins}-{record.losses} ({accuracy}%)
      </p>

      {loading ? (
        <p>Loading picks...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <section className="featured">
            <h2>🏆 LockBox Picks of the Day</h2>
            <div className="locks">
              <div className="lock-card">
                <h3>💰 Moneyline Lock</h3>
                <p>{featured?.moneylineLock?.pick || "No pick"}</p>
                <p>
                  Confidence: {featured?.moneylineLock?.confidence || 0}%
                </p>
              </div>
              <div className="lock-card">
                <h3>🪙 Spread Lock</h3>
                <p>{featured?.spreadLock?.pick || "No pick"}</p>
                <p>
                  Confidence: {featured?.spreadLock?.confidence || 0}%
                </p>
              </div>
              <div className="lock-card">
                <h3>🎯 Prop Lock</h3>
                <p>
                  {featured?.propLock?.player || "No props available"}
                </p>
                <p>
                  Confidence: {featured?.propLock?.confidence || 0}%
                </p>
              </div>
            </div>
          </section>

          <section className="games">
            <h2>🤖 All AI Game Picks</h2>
            {featured?.picks && featured.picks.length > 0 ? (
              featured.picks.map((game, idx) => (
                <div className="game-card" key={idx}>
                  <h3>{game.matchup}</h3>
                  <p>
                    <strong>Book:</strong> {game.bookmaker}
                  </p>
                  <p>
                    <strong>AI Moneyline:</strong>{" "}
                    {game.mlPick.pick} ({game.mlPick.confidence}%)
                  </p>
                  {game.spreadPick && (
                    <p>
                      <strong>AI Spread:</strong>{" "}
                      {game.spreadPick.pick} ({game.spreadPick.confidence}%)
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p>No game picks available right now.</p>
            )}
          </section>

          <p className="updated">
            Updated:{" "}
            {featured.generatedAt
              ? new Date(featured.generatedAt).toLocaleString()
              : "n/a"}
          </p>
        </>
      )}
    </div>
  );
}

export default App;
