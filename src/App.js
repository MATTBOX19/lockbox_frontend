import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [record, setRecord] = useState(null);
  const [locks, setLocks] = useState(null);
  const [picks, setPicks] = useState([]);
  const [loading, setLoading] = useState(true);

  const backend = "https://lockbox-backend-qkx9.onrender.com";

  useEffect(() => {
    async function fetchData() {
      try {
        const [recordRes, featuredRes, picksRes] = await Promise.all([
          fetch(`${backend}/api/record`).then((r) => r.json()),
          fetch(`${backend}/api/featured`).then((r) => r.json()),
          fetch(`${backend}/api/picks`).then((r) => r.json())
        ]);

        setRecord(recordRes);
        setLocks(featuredRes);
        setPicks(picksRes.picks || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading LockBox AI...</div>;

  return (
    <div className="App">
      <h1>💎 LOCKBOX AI</h1>
      <p className="tagline">Win Smarter. Not Harder.</p>

      <div className="record">
        🔥 Record: {record?.wins || 0}-{record?.losses || 0} ({record?.winRate || 0}%)
      </div>

      <section className="featured">
        <h2>🏆 LockBox Picks of the Day</h2>

        <div className="locks">
          <div className="lock-card">
            <h3>💰 Moneyline Lock</h3>
            <p>{locks?.moneylineLock?.pick || "No pick"}</p>
            <small>Confidence: {locks?.moneylineLock?.confidence || 0}%</small>
          </div>

          <div className="lock-card">
            <h3>📏 Spread Lock</h3>
            <p>{locks?.spreadLock?.pick || "No pick"}</p>
            <small>Confidence: {locks?.spreadLock?.confidence || 0}%</small>
          </div>

          <div className="lock-card">
            <h3>🎯 Prop Lock</h3>
            <p>{locks?.propLock?.player || "No props available"}</p>
            <small>Confidence: {locks?.propLock?.confidence || 0}%</small>
          </div>
        </div>
      </section>

      <section className="games">
        <h2>🤖 All AI Game Picks</h2>

        {picks.length > 0 ? (
          picks.map((g, i) => (
            <div key={i} className="game-card">
              <h3>{g.matchup}</h3>
              <p><strong>Book:</strong> {g.bookmaker}</p>
              <p>AI Moneyline: {g.mlPick?.pick} ({g.mlPick?.confidence}%)</p>
              <p>AI Spread: {g.spreadPick?.pick} ({g.spreadPick?.confidence}%)</p>
            </div>
          ))
        ) : (
          <p>No game picks available right now.</p>
        )}
      </section>

      <footer>
        <button className="logout">🔒 Logout</button>
        <p className="powered">
          Powered by <b>LockBox AI</b> — Live Odds & Results
        </p>
      </footer>
    </div>
  );
}

export default App;
