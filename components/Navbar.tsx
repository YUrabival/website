"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  session: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  } | null;
}

export default function Navbar({ session }: NavbarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-extrabold text-gray-900 tracking-tight">
              Auto Parts Store
            </Link>
            <div className="hidden sm:flex gap-4 ml-8">
              <Link
                href="/catalog"
                className={`text-base px-2 py-1 rounded transition font-medium ${isActive("/catalog") ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"}`}
              >
                Каталог
              </Link>
              {session?.user && (
                <>
                  <Link
                    href="/orders"
                    className={`text-base px-2 py-1 rounded transition font-medium ${isActive("/orders") ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"}`}
                  >
                    Заказы
                  </Link>
                  <Link
                    href="/profile"
                    className={`text-base px-2 py-1 rounded transition font-medium ${isActive("/profile") ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"}`}
                  >
                    Профиль
                  </Link>
                </>
              )}
              {session?.user?.role === "MANAGER" && (
                <Link
                  href="/admin"
                  className={`text-base px-2 py-1 rounded transition font-medium ${isActive("/admin") ? "text-blue-700 bg-blue-50" : "text-gray-700 hover:text-blue-700 hover:bg-blue-50"}`}
                >
                  Админ
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <span className="text-base text-gray-700 font-medium px-2">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 