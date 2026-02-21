import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const FROM_EMAIL = 'FitPro <onboarding@resend.dev>';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/verificar-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'FitPro - Confirme seu e-mail',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8B5CF6; font-size: 28px; margin: 0;">FitPro</h1>
        </div>
        <h2 style="color: #E2E8F0; font-size: 20px;">Olá, ${name}! 👋</h2>
        <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">
          Obrigado por se cadastrar no FitPro! Para ativar sua conta, clique no botão abaixo:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Confirmar E-mail
          </a>
        </div>
        <p style="color: #64748B; font-size: 13px;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${verifyUrl}" style="color: #8B5CF6; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #64748B; font-size: 13px;">Este link expira em 24 horas.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
        <p style="color: #475569; font-size: 12px; text-align: center;">
          © 2026 FitPro. Feito com 💜 para profissionais de fitness.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/redefinir-senha?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'FitPro - Redefinir sua senha',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8B5CF6; font-size: 28px; margin: 0;">FitPro</h1>
        </div>
        <h2 style="color: #E2E8F0; font-size: 20px;">Olá, ${name}! 🔐</h2>
        <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">
          Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Redefinir Senha
          </a>
        </div>
        <p style="color: #64748B; font-size: 13px;">
          Se o botão não funcionar, copie e cole este link no navegador:<br>
          <a href="${resetUrl}" style="color: #8B5CF6; word-break: break-all;">${resetUrl}</a>
        </p>
        <p style="color: #64748B; font-size: 13px;">Este link expira em 1 hora. Se você não solicitou essa alteração, ignore este e-mail.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
        <p style="color: #475569; font-size: 12px; text-align: center;">
          © 2026 FitPro. Feito com 💜 para profissionais de fitness.
        </p>
      </div>
    `,
  });
}

export async function sendWelcomeStudentEmail(
  email: string,
  name: string,
  trainerName: string,
  tempPassword: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verificar-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `FitPro - ${trainerName} adicionou você como aluno!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #8B5CF6; font-size: 28px; margin: 0;">FitPro</h1>
        </div>
        <h2 style="color: #E2E8F0; font-size: 20px;">Bem-vindo(a), ${name}! 🎉</h2>
        <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">
          Seu personal trainer <strong>${trainerName}</strong> criou uma conta para você no FitPro.
        </p>
        <div style="background: #1E293B; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="color: #94A3B8; font-size: 13px; margin: 0 0 8px 0;">Seus dados de acesso:</p>
          <p style="color: #E2E8F0; font-size: 15px; margin: 0;">
            📧 <strong>${email}</strong><br>
            🔑 Senha temporária: <strong>${tempPassword}</strong>
          </p>
        </div>
        <p style="color: #94A3B8; font-size: 15px; line-height: 1.6;">
          Primeiro, confirme seu e-mail clicando no botão abaixo:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #8B5CF6; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">
            Confirmar E-mail e Ativar Conta
          </a>
        </div>
        <p style="color: #F59E0B; font-size: 13px;">⚠️ Recomendamos alterar a senha temporária após o primeiro acesso.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;">
        <p style="color: #475569; font-size: 12px; text-align: center;">
          © 2026 FitPro. Feito com 💜 para profissionais de fitness.
        </p>
      </div>
    `,
  });
}
