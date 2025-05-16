import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import nodemailer from "nodemailer";

const verifyEmailSchema = z.object({
  email: z.string().email(),
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = verifyEmailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Email Verification</h1>
        <p>Письмо для подтверждения email отправлено.</p>
      `,
    });

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error('Error verifying email:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email } = z
      .object({
        email: z.string().email(),
      })
      .parse(body);

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {},
    });

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error('Error verifying email:', error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    return new NextResponse("Internal error", { status: 500 });
  }
} 