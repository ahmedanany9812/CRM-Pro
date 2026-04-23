export function generateInviteEmailHTML(
  name: string,
  magicLink: string,
  isReminder: boolean = false,
): string {
  const welcomeText = isReminder
    ? `This is a reminder that an account has been created for you on Whispyr CRM.`
    : `An administrator has created an account for you on Whispyr CRM. You can sign in using the secure link below.`;

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isReminder ? "Reminder: " : ""}You're invited to Whispyr CRM</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
      <div style="background-color: #18181b; padding: 32px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Whispyr CRM</h1>
      </div>
      <div style="padding: 32px; color: #3f3f46; line-height: 1.6;">
        <h2 style="color: #18181b; margin-top: 0;">Welcome, ${name}!</h2>
        <p>${welcomeText}</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${magicLink}" style="display: inline-block; background-color: #18181b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign in to Whispyr CRM</a>
        </div>
        <p style="font-size: 14px; color: #71717a;">This link will expire in 24 hours and can only be used once.</p>
        <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 32px 0;">
        <p style="font-size: 14px; color: #71717a;">If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="font-size: 14px; color: #3b82f6; word-break: break-all;">${magicLink}</p>
      </div>
      <div style="background-color: #fafafa; padding: 24px; text-align: center; font-size: 12px; color: #a1a1aa;">
        &copy; 2026 Whispyr CRM. All rights reserved.
      </div>
    </div>
  </body>
</html>
`.trim();
}
