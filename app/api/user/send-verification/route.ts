import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await req.json();

    // Генерируем код подтверждения
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Сохраняем код в user
    await prisma.user.update({
      where: { email },
      data: {
        verificationCode,
        verificationCodeExpires: new Date(Date.now() + 30 * 60 * 1000),
      },
    });

    // Отправляем код на email
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { message: 'Error sending verification code' },
      { status: 500 }
    );
  }
} 