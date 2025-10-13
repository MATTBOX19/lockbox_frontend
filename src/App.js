// src/App.js  (complete file - copy/paste)
import React, { useEffect, useState, useMemo } from "react";

const FALLBACK_API = "https://lockbox-backend-qkx9.onrender.com";
const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE_URL) ||
  FALLBACK_API;

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState(null);
  const [record, setRecord] = useState({ wins: 0, losses: 0, winRate: 0 });
  const [lastUpdated, setLastUpdated] = useState("");

  const featuredUrl = useMemo(() => `${API_BASE}/api/featured`, []);
  const recordUrl = useMemo(() => `${API_BASE}/api/record`, []);

  async function fetchJSON(url, timeoutMs = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");

      try {
        const [feat, rec] = await Promise.all([
          fetchJSON(featuredUrl),
          fetchJSON(recordUrl).catch(() => null), // record may be empty initially
        ]);

        setFeatured(feat || null);
        if (rec) setRecord(rec);

        const ts =
          feat?.generatedAt ||
          new Date().toISOString();
        setLastUpdated(ts);
      } catch (e) {
        console.error("Frontend fetch error:", e);
        setError(
          `Could not connect to LockBox AI server at ${API_BASE}. (${e.message})`
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [featuredUrl, recordUrl]);

  const Accuracy = useMemo(() => {
    // Only show accuracy for the daily locks per your requirement
    const w = record?.wins || 0;
    const l = record?.losses || 0;
    const total = w + l;
    const pct = total ? Math.round((w / total) * 100) : 0;
    return `${pct}%`;
  }, [record]);

  return (
    <div style={{ color: "#eaffea", background: "#0b0f12", minHeight: "100vh", padding: "32px" }}>
      <h1 style={{ color: "#18ff8b", textAlign: "center" }}>💎 LOCKBOX AI</h1>
      <p style={{ textAlign: "center", marginTop: -8 }}>Win Smarter. Not Harder.</p>

      <div style={{ textAlign: "center", marginTop: 8 }}>
        <span>🔥 Record: {record.wins}-{record.losses} ({Accuracy})</span>
      </div>

      {loading && (
        <p style={{ textAlign: "center", marginTop: 16 }}>Loading picks…</p>
      )}

      {!loading && error && (
        <p style={{ textAlign: "center", color: "#ff5c5c", marginTop: 16 }}>
          {error}
        </p>
      )}

      {!loading && !error && featured && (
        <>
          {/* Picks of the Day */}
          <div
            style={{
              maxWidth: 1100,
              margin: "24px auto",
              padding: 16,
              borderRadius: 12,
              background: "#0e1317",
              boxShadow: "0 0 24px rgba(0,0,0,0.4)"
            }}
          >
            <h2 style={{ textAlign: "center" }}>🏆 LockBox Picks of the Day</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
                marginTop: 12
              }}
            >
              <Card
                title="💰 Moneyline Lock"
                line1={featured.moneylineLock?.pick || "No pick"}
                line2={
                  featured.moneylineLock
                    ? `Confidence: ${featured.moneylineLock.confidence}%`
                    : "Confidence: 0%"
                }
              />
              <Card
                title="📏 Spread Lock"
                line1={featured.spreadLock?.pick || "No pick"}
                line2={
                  featured.spreadLock
                    ? `Confidence: ${featured.spreadLock.confidence}%`
                    : "Confidence: 0%"
                }
              />
              <Card
                title="🎯 Prop Lock"
                line1={
                  featured.propLock?.player
                    ? `${featured.propLock.player} • ${featured.propLock.market || ""}`
                    : "No props available"
                }
                line2={`Confidence: ${featured.propLock?.confidence || 0}%`}
              />
            </div>
          </div>

          {/* All AI Game Picks */}
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center" }}>🤖 All AI Game Picks</h2>
            {Array.isArray(featured.picks) && featured.picks.length > 0 ? (
              featured.picks.map((g, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0e1317",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 14,
                    boxShadow: "0 0 16px rgba(0,0,0,0.35)"
                  }}
                >
                  <h3 style={{ margin: 0 }}>{g.matchup}</h3>
                  <div style={{ opacity: 0.7, marginTop: 4 }}>Book: {g.bookmaker}</div>
                  <div style={{ marginTop: 10 }}>
                    <div>
                      <strong>AI Moneyline:</strong>{" "}
                      {g.mlPick ? `${g.mlPick.pick} (${g.mlPick.confidence}%)` : "—"}
                    </div>
                    <div>
                      <strong>AI Spread:</strong>{" "}
                      {g.spreadPick
                        ? `${g.spreadPick.pick} (${g.spreadPick.confidence}%)`
                        : "—"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", opacity: 0.8 }}>
                No game picks available right now.
              </p>
            )}
          </div>

          <div style={{ textAlign: "center", opacity: 0.7, marginTop: 18 }}>
            Updated: {new Date(lastUpdated).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}

function Card({ title, line1, line2 }) {
  return (
    <div
      style={{
        background: "#10171d",
        borderRadius: 12,
        padding: 16,
        textAlign: "center",
        border: "1px solid rgba(255,255,255,0.06)"
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 16 }}>{line1}</div>
      <div style={{ opacity: 0.8, marginTop: 6 }}>{line2}</div>
    </div>
  );
}

export default App;
