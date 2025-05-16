"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { CartSheet } from './CartSheet';

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdown, setProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Закрытие дропдауна по клику вне
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdown(false);
      }
    }
    if (profileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdown]);

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 dark:bg-gray-900 bg-white border-b dark:border-gray-800 border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="font-bold text-xl dark:text-white text-gray-900">AutoParts</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition ${
                isActive("/")
                  ? "text-blue-600"
                  : "dark:text-gray-300 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Главная
            </Link>
            <Link
              href="/catalog"
              className={`text-sm font-medium transition ${
                isActive("/catalog")
                  ? "text-blue-600"
                  : "dark:text-gray-300 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Каталог
            </Link>
            <Link
              href="/about"
              className={`text-sm font-medium transition ${
                isActive("/about")
                  ? "text-blue-600"
                  : "dark:text-gray-300 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              О нас
            </Link>
            <Link
              href="/contacts"
              className={`text-sm font-medium transition ${
                isActive("/contacts")
                  ? "text-blue-600"
                  : "dark:text-gray-300 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              Контакты
            </Link>
            {session?.user?.role === 'admin' && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition ${
                  isActive("/admin")
                    ? "text-purple-600"
                    : "dark:text-gray-300 text-gray-700 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                Админ панель
              </Link>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-13z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><circle cx="19" cy="21" r="1" stroke="currentColor" strokeWidth="2"/></svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="max-w-md w-full">
                <div className="pt-4 pb-2 px-2 text-xl font-bold">Корзина</div>
                <CartSheet />
              </SheetContent>
            </Sheet>
            {session ? (
              <div className="relative" ref={profileRef}>
                <button
                  className="flex items-center gap-2 p-2 dark:text-gray-300 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition rounded-full border border-transparent hover:border-blue-600"
                  onClick={() => setProfileDropdown((v) => !v)}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden lg:block font-medium text-sm">{session.user?.name || 'Профиль'}</span>
                </button>
                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-56 dark:bg-gray-900 bg-white rounded-xl shadow-lg border dark:border-gray-700 border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
                      <div className="w-9 h-9 rounded-full bg-[#23272f] flex items-center justify-center text-white font-bold text-lg">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{session.user?.name}</div>
                        <div className="text-xs text-[#b0b8c1]">{session.user?.email || 'Нет email'}</div>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm dark:text-gray-300 text-gray-700 hover:bg-gray-800 rounded-lg transition"
                      onClick={() => setProfileDropdown(false)}
                    >
                      Мой профиль
                    </Link>
                    {session?.user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm dark:text-gray-300 text-gray-700 hover:bg-gray-800 rounded-lg transition"
                        onClick={() => setProfileDropdown(false)}
                      >
                        Админ панель
                      </Link>
                    )}
                    <button
                      onClick={async () => { setProfileDropdown(false); await signOut({ redirect: false }); router.push('/'); }}
                      className="block w-full text-left px-4 py-2 text-sm dark:text-gray-300 text-gray-700 hover:bg-gray-800 rounded-lg transition"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/api/auth/signin"
                className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition"
              >
                Войти
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent>
            <nav className="flex flex-col space-y-4 mt-8">
              <Link
                href="/"
                className={`text-lg font-medium hover:text-primary ${
                  pathname === '/' ? 'text-primary' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Главная
              </Link>
              <Link
                href="/catalog"
                className={`text-lg font-medium hover:text-primary ${
                  pathname === '/catalog' ? 'text-primary' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Каталог
              </Link>
              <Link
                href="/about"
                className={`text-lg font-medium hover:text-primary ${
                  pathname === '/about' ? 'text-primary' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                О нас
              </Link>
              {session?.user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`text-lg font-medium hover:text-purple-600 ${
                    pathname === '/admin' ? 'text-purple-600' : ''
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Админ панель
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Search Modal */}
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4">
            <div className="w-full max-w-2xl dark:bg-gray-900 bg-white rounded-2xl shadow-lg border dark:border-gray-700 border-gray-100 p-4 mt-20">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border dark:border-gray-700 border-gray-300 px-4 py-2 pl-10 dark:bg-gray-800 bg-white dark:text-white text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 dark:text-gray-300 text-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 