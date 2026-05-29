-- Student registration approval & email tracking (uses existing users.status column)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS rejection_reason text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status_updated_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS status_updated_by text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS registration_email_sent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

COMMENT ON COLUMN users.status IS 'Student approval: pending | approved | rejected';
COMMENT ON COLUMN users.rejection_reason IS 'Shown to student when status is rejected';
