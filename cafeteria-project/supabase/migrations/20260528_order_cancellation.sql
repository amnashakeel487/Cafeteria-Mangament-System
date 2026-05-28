-- Order cancellation & refund columns (ALTER only — do not recreate orders table)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_status TEXT,
  ADD COLUMN IF NOT EXISTS refund_note TEXT;

-- Optional: document allowed values (enforcement is in application layer)
COMMENT ON COLUMN orders.cancelled_by IS 'student | cafeteria';
COMMENT ON COLUMN orders.refund_status IS 'not_applicable | pending | approved | rejected';
