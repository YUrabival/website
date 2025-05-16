import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, code: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Подтверждение email - AutoPartsExpress',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Подтверждение email</h2>
        <p>Здравствуйте!</p>
        <p>Для подтверждения вашего email адреса, пожалуйста, введите следующий код:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p>Код действителен в течение 30 минут.</p>
        <p>Если вы не запрашивали подтверждение email, проигнорируйте это письмо.</p>
        <p>С уважением,<br>Команда AutoPartsExpress</p>
      </div>
    `,
  });
}; 