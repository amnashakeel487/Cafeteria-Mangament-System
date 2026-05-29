-- Student favorites / bookmarks

CREATE TABLE IF NOT EXISTS favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id text NOT NULL,
  menu_item_id bigint NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  cafeteria_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_student ON favorites (student_id);
CREATE INDEX IF NOT EXISTS idx_favorites_menu_item ON favorites (menu_item_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS favorites_select ON favorites;
DROP POLICY IF EXISTS favorites_insert ON favorites;
DROP POLICY IF EXISTS favorites_delete ON favorites;

CREATE POLICY favorites_select ON favorites FOR SELECT USING (true);
CREATE POLICY favorites_insert ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY favorites_delete ON favorites FOR DELETE USING (true);
