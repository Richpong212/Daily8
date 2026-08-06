import { appConfig } from "../config/index.config";

export const passwordResetEmail = (name: string, token: string) => {
  const resetUrl = `${appConfig.app.clientUrl}/reset-password/${token}`;
  const currentYear = new Date().getFullYear();

  const subject = "Reset your Daily 8 password";

  const text = `Hey ${name},

Use this link to reset your Daily 8 password:
${resetUrl}

This link expires in 30 minutes. If you did not request a password reset, ignore this email.

Daily 8
© ${currentYear} Daily 8
`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reset your password</title>
  </head>
  <body style="margin:0; padding:0; background:#ffffff;">
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="margin:0 0 12px; color:#111;">Hey ${name},</h2>
      <p style="margin:0 0 16px; color:#333;">Use this secure link to reset your Daily 8 password:</p>
      <p style="margin:0 0 18px;">
        <a href="${resetUrl}" style="display:inline-block; padding:10px 16px; background:#1f4d38; color:#fff; text-decoration:none; border-radius:4px; font-weight:600;" target="_blank" rel="noopener">
          Reset password
        </a>
      </p>
      <p style="margin:0 0 6px; color:#555; font-size:13px;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="margin:0 0 16px; color:#111; font-size:13px; word-break:break-all;">
        <a href="${resetUrl}" target="_blank" rel="noopener" style="color:#1f4d38;">${resetUrl}</a>
      </p>
      <p style="margin:0 0 16px; color:#666; font-size:13px;">
        This link expires in 30 minutes. If you did not request a password reset, ignore this email.
      </p>
      <p style="margin:0; color:#333;">Daily 8</p>
      <p style="margin:12px 0 0; color:#999; font-size:12px;">© ${currentYear} Daily 8</p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
};
