"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Login failed");
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
      >
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-400">Access your compliance dashboard</p>
        </div>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
          required
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          Sign in
        </button>
        <p className="text-center text-sm text-slate-400">
          No account?{" "}
          <Link href="/register" className="text-emerald-400 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
