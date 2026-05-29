const BASE_URL = process.env.FRONTEND_URL || 'https://comsats-cafeteria.vercel.app';

function emailShell({ title, accent, bodyHtml, ctaLabel, ctaHref }) {
  const btn = ctaLabel
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr><td align="center" style="border-radius:8px;background:${accent};">
          <a href="${ctaHref}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;color:#0d1117;text-decoration:none;">${ctaLabel}</a>
        </td></tr></table>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d1117;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#161f2e;border-radius:12px;overflow:hidden;border:1px solid #2d3748;">
        <tr><td style="padding:32px 28px 20px;text-align:center;border-bottom:1px solid #2d3748;">
          <p style="margin:0;font-size:22px;font-weight:bold;color:${accent};letter-spacing:0.5px;">COMSTAS Cafe</p>
          <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Campus Food Management</p>
        </td></tr>
        <tr><td style="padding:28px 28px 32px;color:#e2e8f0;font-size:15px;line-height:1.65;">
          ${bodyHtml}
          ${btn}
        </td></tr>
        <tr><td style="padding:20px 28px;text-align:center;background-color:#121a27;border-top:1px solid #2d3748;">
          <p style="margin:0;font-size:11px;color:#64748b;">COMSTAS Cafe | Campus Food Management</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function registrationReceivedTemplate(studentName) {
  const name = studentName || 'Student';
  const bodyHtml = `
    <p style="margin:0 0 16px;color:#f1f5f9;font-size:17px;font-weight:bold;">Hi ${name},</p>
    <p style="margin:0 0 14px;color:#cbd5e1;">Thank you for registering on <strong style="color:#06d6c7;">COMSTAS Cafe</strong>!</p>
    <p style="margin:0 0 14px;color:#cbd5e1;">Your account is currently <strong style="color:#fbbf24;">pending approval</strong> from our admin team. You will receive another email once your account has been reviewed — usually within 24 hours.</p>
    <p style="margin:0;color:#94a3b8;font-size:14px;">In the meantime, you can browse our public menu without logging in.</p>
  `;

  return {
    subject: 'Registration Received — COMSTAS Cafe',
    htmlContent: emailShell({
      title: 'Registration Received',
      accent: '#06d6c7',
      bodyHtml,
      ctaLabel: 'Browse Menu',
      ctaHref: `${BASE_URL}/#browse-menu`,
    }),
    textContent: `Hi ${name}, your registration has been received and is pending approval. Browse the menu at ${BASE_URL}/#browse-menu`,
  };
}

function approvalEmailTemplate(studentName, studentEmail) {
  const name = studentName || 'Student';
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td align="center" style="padding:16px;background:#065f46;border-radius:8px;">
        <p style="margin:0;font-size:28px;">🎉</p>
        <p style="margin:8px 0 0;font-size:16px;font-weight:bold;color:#6ee7b7;">Account Approved!</p>
      </td></tr>
    </table>
    <p style="margin:0 0 16px;color:#f1f5f9;font-size:17px;font-weight:bold;">Hi ${name},</p>
    <p style="margin:0 0 14px;color:#cbd5e1;">Great news! Your COMSTAS Cafe account has been <strong style="color:#34d399;">approved</strong>.</p>
    <p style="margin:0 0 14px;color:#cbd5e1;">You can now log in and start ordering from your campus cafeterias.</p>
    <p style="margin:0 0 20px;color:#94a3b8;font-size:14px;">Your registered email: <strong style="color:#06d6c7;">${studentEmail || ''}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#121a27;border-radius:8px;padding:16px;">
      <tr><td style="color:#94a3b8;font-size:13px;line-height:1.8;">
        ✓ Browse daily menus<br>
        ✓ Place orders easily<br>
        ✓ Track in real-time<br>
        ✓ Easy campus pickup
      </td></tr>
    </table>
  `;

  return {
    subject: 'Your Account Has Been Approved — COMSTAS Cafe',
    htmlContent: emailShell({
      title: 'Account Approved',
      accent: '#34d399',
      bodyHtml,
      ctaLabel: 'Login Now →',
      ctaHref: `${BASE_URL}/student/login`,
    }),
    textContent: `Hi ${name}, your account has been approved. Login at ${BASE_URL}/student/login with ${studentEmail || 'your email'}.`,
  };
}

function rejectionEmailTemplate(studentName, rejectionReason) {
  const name = studentName || 'Student';
  const reason = rejectionReason || 'No reason provided.';
  const bodyHtml = `
    <p style="margin:0 0 16px;color:#f1f5f9;font-size:17px;font-weight:bold;">Hi ${name},</p>
    <p style="margin:0 0 14px;color:#cbd5e1;">After reviewing your registration, we were unable to approve your account at this time.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background:#422006;border-left:4px solid #f59e0b;border-radius:6px;">
      <tr><td style="padding:14px 16px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:bold;color:#fbbf24;text-transform:uppercase;">Reason</p>
        <p style="margin:0;color:#fde68a;font-size:14px;line-height:1.5;">${reason.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      </td></tr>
    </table>
    <p style="margin:0 0 14px;color:#cbd5e1;">If you believe this is a mistake or would like to re-apply, please contact us or register again with the correct information.</p>
    <p style="margin:0;color:#94a3b8;font-size:13px;">Questions? Visit our <a href="${BASE_URL}/contact" style="color:#06d6c7;">contact page</a>.</p>
  `;

  return {
    subject: 'Account Registration Update — COMSTAS Cafe',
    htmlContent: emailShell({
      title: 'Registration Update',
      accent: '#f59e0b',
      bodyHtml,
      ctaLabel: 'Register Again →',
      ctaHref: `${BASE_URL}/student/register`,
    }),
    textContent: `Hi ${name}, your registration was not approved. Reason: ${reason}. Register again at ${BASE_URL}/student/register`,
  };
}

module.exports = {
  registrationReceivedTemplate,
  approvalEmailTemplate,
  rejectionEmailTemplate,
};
