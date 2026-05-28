-- Notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_type text NOT NULL,
  recipient_id text NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient
  ON notifications (recipient_type, recipient_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Custom JWT app: backend inserts via API; frontend realtime filters client-side.
-- Prefer SUPABASE_SERVICE_ROLE_KEY on the server. Enable Replication for this table in Dashboard.
CREATE POLICY "notifications_select" ON notifications
  FOR SELECT USING (true);

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (true);

CREATE POLICY "notifications_delete" ON notifications
  FOR DELETE USING (true);
