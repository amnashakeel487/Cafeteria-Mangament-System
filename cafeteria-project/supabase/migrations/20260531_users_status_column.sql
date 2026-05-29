-- Required for student registration approval (add if missing on older databases)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

UPDATE users
SET status = 'approved'
WHERE role = 'student' AND (status IS NULL OR status = '');

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE users
  ADD CONSTRAINT users_status_check
  CHECK (status IS NULL OR status IN ('pending', 'approved', 'rejected'));

COMMENT ON COLUMN users.status IS 'Student approval: pending | approved | rejected';
