"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import { saveSession, ROLE_HOME } from "../../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const tokenResponse = await api.login(email, password);
      saveSession(tokenResponse);
      router.push(ROLE_HOME[tokenResponse.role] || "/login");
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="glass-panel w-full max-w-sm p-8">
        <h1 className="text-2xl font-semibold mb-1">Salarite HR</h1>
        <p className="text-slate-400 text-sm mb-6">Sign in to your dashboard</p>

        <label className="block text-sm text-slate-300 mb-1" htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="glass-input mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block text-sm text-slate-300 mb-1" htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          className="glass-input mb-5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className="text-rose-400 text-sm mb-4">{error}</p>}

        <button type="submit" className="btn-primary w-full">Log in</button>
      </form>
    </main>
  );
}