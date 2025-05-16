'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';

export function AuthButtons() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/profile">
            <User className="h-6 w-6" />
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => signOut()}>
          Выйти
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn()}>
      Войти
    </Button>
  );
} 