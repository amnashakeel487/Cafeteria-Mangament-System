-- Track whether the student received the account-approved email

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS approval_email_sent boolean DEFAULT false;

COMMENT ON COLUMN users.approval_email_sent IS 'True after Brevo sends the account-approved email';
