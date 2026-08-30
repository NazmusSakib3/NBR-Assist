"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessType, setBusinessType] = useState("retail");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, businessType }),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Registration failed");
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
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-slate-400">Start managing compliance with AI</p>
        </div>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Full name"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
          required
        />
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
          placeholder="Password (min 8 chars)"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
          required
        />
        <select
          value={businessType}
          onChange={(event) => setBusinessType(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm"
        >
          <option value="retail">Retail</option>
          <option value="restaurant">Restaurant</option>
          <option value="freelancer">Freelancer</option>
          <option value="export">Export</option>
        </select>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-medium text-slate-950 hover:bg-emerald-400"
        >
          Create account
        </button>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
