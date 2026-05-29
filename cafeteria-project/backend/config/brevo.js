const { BrevoClient } = require('@getbrevo/brevo');

const DEFAULT_SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'COMSTAS Cafe',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@comstascafe.com',
};

let client;

function getClient() {
  if (!process.env.BREVO_API_KEY) return null;
  if (!client) {
    client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
  }
  return client;
}

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  const brevo = getClient();
  if (!brevo) {
    console.warn('BREVO_API_KEY not set — email skipped');
    return { success: false, error: new Error('BREVO_API_KEY not configured') };
  }

  try {
    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent,
      textContent: textContent || '',
      sender: DEFAULT_SENDER,
      to: [{ email: to.email, name: to.name || to.email }],
    });
    console.log('Email sent successfully to:', to.email);
    return { success: true, result };
  } catch (error) {
    console.error('Brevo email error:', error?.message || error);
    return { success: false, error };
  }
};

module.exports = { sendEmail, DEFAULT_SENDER };
