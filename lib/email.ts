import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Подтверждение email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Подтверждение email</h2>
        <p>Здравствуйте!</p>
        <p>Для подтверждения вашего email адреса, пожалуйста, введите следующий код:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #2563eb; margin: 0; font-size: 32px;">${code}</h1>
        </div>
        <p>Код действителен в течение 30 минут.</p>
        <p>Если вы не запрашивали подтверждение email, проигнорируйте это письмо.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 14px;">Это письмо отправлено автоматически, пожалуйста, не отвечайте на него.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
} 