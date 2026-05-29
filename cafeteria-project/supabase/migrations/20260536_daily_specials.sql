-- Daily specials & announcements per cafeteria
CREATE TABLE IF NOT EXISTS daily_specials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id text NOT NULL,
  title text NOT NULL,
  description text,
  special_type text NOT NULL DEFAULT 'special',
  menu_item_id bigint REFERENCES menu_items(id) ON DELETE SET NULL,
  original_price numeric(10,2),
  special_price numeric(10,2),
  discount_percentage integer,
  valid_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time DEFAULT '00:00',
  end_time time DEFAULT '23:59',
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  image_url text,
  view_count integer DEFAULT 0,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT daily_specials_type_check CHECK (
    special_type IN ('special', 'announcement', 'discount', 'new_item', 'limited_time')
  )
);

CREATE INDEX IF NOT EXISTS idx_daily_specials_date ON daily_specials(valid_date, cafeteria_id);
CREATE INDEX IF NOT EXISTS idx_daily_specials_active ON daily_specials(is_active, valid_date);

ALTER TABLE daily_specials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_active_specials ON daily_specials;
CREATE POLICY public_read_active_specials ON daily_specials
  FOR SELECT USING (is_active = true);

-- Realtime (run in Dashboard → Database → Replication if ADD fails)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE daily_specials;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;
