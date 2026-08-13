const nodemailer = require('nodemailer');

const isSmtpConfigured = () => Boolean(
  process.env.SMTP_HOST
    && process.env.SMTP_PORT
    && process.env.SMTP_USER
    && process.env.SMTP_PASS
);

const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
  },
});

const buildResetPasswordEmail = ({ resetLink, expiresInMinutes }) => ({
  subject: 'Reinitialisation de votre mot de passe - SmartIntern AI',
  text: [
    'Bonjour,',
    '',
    'Vous avez demande la reinitialisation de votre mot de passe SmartIntern AI.',
    `Lien de reinitialisation: ${resetLink}`,
    `Ce lien expire dans ${expiresInMinutes} minutes.`,
    '',
    "Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.",
    '',
    "L'equipe SmartIntern AI",
  ].join('\n'),
  html: `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2>Reinitialisation de votre mot de passe</h2>
      <p>Vous avez demande la reinitialisation de votre mot de passe SmartIntern AI.</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;background:#0f5bd7;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
          Reinitialiser mon mot de passe
        </a>
      </p>
      <p>Ce lien expire dans ${expiresInMinutes} minutes.</p>
      <p>Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.</p>
    </div>
  `,
});

const sendPasswordResetEmail = async ({ to, resetLink, expiresInMinutes }) => {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('SMTP is not configured. Development reset link is available only in the API response.');
    } else {
      console.warn('SMTP is not configured. Password reset email was not sent.');
    }

    return { sent: false, fallback: 'response' };
  }

  const transporter = createTransporter();
  const email = buildResetPasswordEmail({ resetLink, expiresInMinutes });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    ...email,
  });

  return { sent: true, fallback: null };
};

module.exports = {
  sendPasswordResetEmail,
  isSmtpConfigured,
};
