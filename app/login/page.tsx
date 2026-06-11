"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. If you don't have an account, please sign up first.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Gym Buddy</h1>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg bg-[#27272a] border border-[#3f3f46] text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#27272a] border border-[#3f3f46] text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#6c63ff] hover:bg-[#5b53e8] text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#6c63ff] hover:text-[#8b85ff] font-medium transition"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
