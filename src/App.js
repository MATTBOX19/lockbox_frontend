import React, { useEffect, useState } from "react";
import "./App.css";

const BACKEND_URL = "https://lockbox-backend-qkx9.onrender.com";

function App() {
  const [picks, setPicks] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [picksRes, recordRes, featuredRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/picks`),
          fetch(`${BACKEND_URL}/api/record`),
          fetch(`${BACKEND_URL}/api/featured`),
        ]);

        const picksData = await picksRes.json();
        const recordData = await recordRes.json();
        const featuredData = await featuredRes.json();

        setPicks(picksData.picks || []);
        setRecord(recordData);
        setFeatured(featuredData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">⚡ Loading LockBox AI...</div>;

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">💎 LOCKBOX AI</h1>
        <p className="subtitle">Win Smarter. Not Harder.</p>
        <p className="record">
          🔥 Record: {record.wins}-{record.losses} ({record.winRate}%)
        </p>
      </header>

      {featured && (
        <div className="featured">
          <h2 className="section-title">🏆 LockBox Picks of the Day</h2>

          <div className="featured-grid">
            {featured.moneylineLock && (
              <div className="featured-card">
                <h3>💰 Moneyline Lock</h3>
                <p className="highlight">{featured.moneylineLock.pick}</p>
                <p className="odds">
                  Odds: {featured.moneylineLock.homeML} / {featured.moneylineLock.awayML}
                </p>
                <div className="bar">
                  <div
                    className="fill"
                    style={{
                      width: `${featured.moneylineLock.confidence}%`,
                    }}
                  ></div>
                </div>
                <p className="confidence">
                  Confidence: {featured.moneylineLock.confidence}%
                </p>
              </div>
            )}

            {featured.spreadLock && (
              <div className="featured-card">
                <h3>📏 Spread Lock</h3>
                <p className="highlight">{featured.spreadLock.pick}</p>
                <p className="odds">
                  Spread: {featured.spreadLock.homeSpread?.point || "?"}
                </p>
                <div className="bar">
                  <div
                    className="fill"
                    style={{
                      width: `${featured.spreadLock.confidence}%`,
                      background: "#45a29e",
                    }}
                  ></div>
                </div>
                <p className="confidence">
                  Confidence: {featured.spreadLock.confidence}%
                </p>
              </div>
            )}

            {featured.propLock && (
              <div className="featured-card">
                <h3>🎯 Prop Lock</h3>
                <p className="highlight">{featured.propLock.player}</p>
                <p className="odds">{featured.propLock.market}</p>
                <div className="bar">
                  <div
                    className="fill"
                    style={{
                      width: `${featured.propLock.confidence}%`,
                      background: "#ffcc66",
                    }}
                  ></div>
                </div>
                <p className="confidence">
                  Confidence: {featured.propLock.confidence}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <h2 className="section-title">🤖 All AI Game Picks</h2>
      <div className="picks-grid">
        {picks.map((game, i) => (
          <div className="card" key={i}>
            <h3>{game.matchup}</h3>
            <p className="bookmaker">{game.bookmaker}</p>
            {game.mlPick && (
              <p>
                <b>AI Moneyline:</b> {game.mlPick.pick} (
                {game.mlPick.confidence}%)
              </p>
            )}
            {game.spreadPick && (
              <p>
                <b>AI Spread:</b> {game.spreadPick.pick} (
                {game.spreadPick.confidence}%)
              </p>
            )}
          </div>
        ))}
      </div>

      <footer className="footer">
        <button className="logout-btn">🔒 Logout</button>
        <p className="powered">
          ⚙️ Powered by <b>LockBox AI</b> — Live Odds & Results
        </p>
      </footer>
    </div>
  );
}

export default App;
