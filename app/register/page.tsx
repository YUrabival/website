"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка регистрации");
      }
      router.push("/login?registered=true");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c23] via-[#232b3b] to-[#181c23] overflow-hidden">
      {/* SVG паттерн/фон */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="700" cy="100" r="80" fill="#2563eb" fillOpacity="0.15" />
        <circle cx="100" cy="500" r="120" fill="#2563eb" fillOpacity="0.10" />
        <rect x="200" y="200" width="400" height="200" rx="100" fill="#2563eb" fillOpacity="0.07" />
      </svg>
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Лого/иконка */}
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-blue-600 rounded-full p-3 shadow-lg mb-2">
            <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><path d="M3 17V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" stroke="#fff" strokeWidth="2"/><path d="M7 10h10M7 14h6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">AutoParts</span>
        </div>
        <div className="w-full bg-gray-900/90 rounded-2xl shadow-2xl p-10 flex flex-col gap-6">
          <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Регистрация</h2>
          <p className="text-center text-gray-400 mb-4">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-blue-400 hover:underline">Войти</Link>
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full rounded-lg bg-gray-800 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-lg"
                  placeholder="Имя"
                />
              </div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-lg bg-gray-800 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-lg"
                  placeholder="Email"
                />
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg bg-gray-800 text-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-lg pr-12"
                  placeholder="Пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 