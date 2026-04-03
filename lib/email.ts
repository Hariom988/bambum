import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, rawToken: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${rawToken}`;

  await transporter.sendMail({
    from: `"Bambum" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Verify your Bambum account",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #faf7f2; border: 1px solid #e0d8cc;">
        <h1 style="font-family: Georgia, serif; font-size: 1.8rem; letter-spacing: 0.04em; color: #1a1a1a; margin-bottom: 8px;">BAMBUM</h1>
        <p style="color: #6b6b6b; margin-bottom: 24px;">Thanks for signing up. Please verify your email address to complete registration.</p>
        <a href="${url}" style="display: inline-block; background: #c8a97e; color: #fff; text-decoration: none; padding: 12px 28px; font-weight: 600; letter-spacing: 0.06em; font-size: 0.85rem;">VERIFY EMAIL</a>
        <p style="color: #6b6b6b; font-size: 0.78rem; margin-top: 24px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, rawToken: string) {
  const url = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${rawToken}`;

  await transporter.sendMail({
    from: `"Bambum" <${process.env.SMTP_FROM}>`,
    to,
    subject: "Reset your Bambum password",
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #faf7f2; border: 1px solid #e0d8cc;">
        <h1 style="font-family: Georgia, serif; font-size: 1.8rem; letter-spacing: 0.04em; color: #1a1a1a; margin-bottom: 8px;">BAMBUM</h1>
        <p style="color: #6b6b6b; margin-bottom: 24px;">We received a request to reset your password. Click below to set a new one.</p>
        <a href="${url}" style="display: inline-block; background: #c8a97e; color: #fff; text-decoration: none; padding: 12px 28px; font-weight: 600; letter-spacing: 0.06em; font-size: 0.85rem;">RESET PASSWORD</a>
        <p style="color: #6b6b6b; font-size: 0.78rem; margin-top: 24px;">This link expires in 1 hour. If this wasn't you, you can safely ignore this email.</p>
      </div>
    `,
  });
}