const DEFAULT_SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'COMSTAS Cafe',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@comstascafe.com',
};

let client;

function getClient() {
  if (!process.env.BREVO_API_KEY) return null;
  if (!client) {
    try {
      const { BrevoClient } = require('@getbrevo/brevo');
      client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
    } catch (err) {
      console.warn('Brevo SDK unavailable:', err?.message || err);
      return null;
    }
  }
  return client;
}

function brevoErrorMessage(error) {
  if (!error) return 'Unknown email error';
  if (error.body?.message) return error.body.message;
  if (typeof error.body === 'string') return error.body;
  return error.message || String(error);
}

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  const brevo = getClient();
  if (!brevo) {
    console.warn('BREVO_API_KEY not set — email skipped');
    return { success: false, error: new Error('BREVO_API_KEY not configured') };
  }

  const recipient = {
    email: (to.email || '').trim().toLowerCase(),
    name: to.name || to.email,
  };
  if (!recipient.email) {
    return { success: false, error: new Error('Recipient email is required') };
  }

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      textContent: textContent || '',
      sender: DEFAULT_SENDER,
      to: [recipient],
    });
    console.log('Email sent successfully to:', recipient.email, subject);
    return { success: true, result };
  } catch (error) {
    const detail = brevoErrorMessage(error);
    console.error('Brevo email error:', recipient.email, detail, error?.body || '');
    return { success: false, error: new Error(detail) };
  }
};

module.exports = { sendEmail, DEFAULT_SENDER };
