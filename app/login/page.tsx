"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Clock, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Неверный email или пароль");
        return;
      }
      router.push("/");
      router.refresh();
    } catch (error) {
      setError("Ошибка входа. Попробуйте ещё раз.");
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
          <h2 className="text-3xl font-extrabold text-white mb-2 text-center">Вход в аккаунт</h2>
          <p className="text-center text-gray-400 mb-4">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-blue-400 hover:underline">Зарегистрироваться</Link>
          </p>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
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
                  autoComplete="current-password"
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
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        </div>
        {/* Преимущества */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <ShieldCheck className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">100% Безопасно</span>
            <span className="text-gray-400 text-sm text-center">Ваши данные защищены SSL и не хранятся на сервере</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Clock className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Быстрый вход</span>
            <span className="text-gray-400 text-sm text-center">Вход и регистрация занимают не больше минуты</span>
          </div>
          <div className="flex flex-col items-center bg-gray-900/80 rounded-xl p-4 shadow">
            <Lock className="text-blue-500 mb-2" size={32} />
            <span className="text-white font-semibold">Поддержка 24/7</span>
            <span className="text-gray-400 text-sm text-center">Поможем с любым вопросом в любое время</span>
          </div>
        </div>
      </div>
    </div>
  );
} 