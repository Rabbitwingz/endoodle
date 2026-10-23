"use client";

import { useState } from "react";
import LowPoly from "../LowPoly";
import Wordmark from "../Wordmark";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/";
      return;
    }
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? "Sign-in failed.");
    setLoading(false);
  }

  return (
    <main className="login">
      <LowPoly className="login-art" />
      <div className="login-content">
        <Wordmark />
        <h1 className="hero-title">Endoodle</h1>
        <p className="hero-tagline">On-brand illustrations for the Enparadigm team, in seconds.</p>
        <span className="hero-bar" />
        <form className="card login-card" onSubmit={submit}>
          <label htmlFor="password">Team password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={loading || !password}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
