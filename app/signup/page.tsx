"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      // Automatically sign in
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      setLoading(false);

      if (result?.error) {
        setError("Account created, but automatic sign-in failed. Please sign in manually.");
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err) {
      setError("Failed to create account. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0f] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Gym Buddy</h1>
          <p className="text-gray-400 text-sm">Create your account</p>
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
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg bg-[#27272a] border border-[#3f3f46] text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="signup-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="unique_username"
                className="w-full px-4 py-3 rounded-lg bg-[#27272a] border border-[#3f3f46] text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="signup-email"
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
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-lg bg-[#27272a] border border-[#3f3f46] text-white placeholder-gray-500 focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff] transition"
              />
            </div>

            <button
              id="signup-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-[#6c63ff] hover:bg-[#5b53e8] text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#6c63ff] hover:text-[#8b85ff] font-medium transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
