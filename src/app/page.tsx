"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("mp_token")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        localStorage.setItem("mp_token", "authenticated");
        document.cookie = "mp_auth=true; path=/; max-age=86400";
        router.push("/dashboard");
      } else {
        setError("Invalid Terminal Access Key");
      }
    } catch (err) {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative font-inter">
      <div className="z-10 w-full max-w-sm px-6">
        <div className="bg-card border border-border p-10 rounded-xl shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-green mono">
              ⚡ MARKETPULSE
            </h1>
            <p className="text-secondary text-[10px] uppercase tracking-widest font-black mono">
              RESEARCH TERMINAL · v2.1
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mono">
                Access Key
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-green text-foreground placeholder:text-muted mono"
                required
              />
            </div>

            {error && (
              <p className="text-red text-xs font-bold mono bg-red/10 p-3 rounded border border-red/20 text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green hover:bg-green/90 text-background font-black py-4 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 mono text-sm uppercase tracking-widest"
            >
              {loading ? "INITIALIZING..." : "ENTER TERMINAL"}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-[9px] text-muted font-bold uppercase tracking-[0.2em] mono">
              Analysis: Groq LLaMA 3.3 · Data: Yahoo Finance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
