-- Ratings & reviews

CREATE TABLE IF NOT EXISTS menu_item_ratings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id bigint NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cafeteria_id text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  is_visible boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE (menu_item_id, student_id, order_id)
);

CREATE TABLE IF NOT EXISTS cafeteria_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cafeteria_id text NOT NULL,
  student_id text NOT NULL,
  order_id bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  is_visible boolean DEFAULT true,
  cafeteria_reply text,
  cafeteria_replied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (cafeteria_id, student_id, order_id)
);

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS avg_rating numeric(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

ALTER TABLE cafeterias
  ADD COLUMN IF NOT EXISTS avg_rating numeric(3, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_menu_item_ratings_item ON menu_item_ratings (menu_item_id) WHERE is_visible = true;
CREATE INDEX IF NOT EXISTS idx_cafeteria_reviews_cafe ON cafeteria_reviews (cafeteria_id) WHERE is_visible = true;

ALTER TABLE menu_item_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafeteria_reviews ENABLE ROW LEVEL SECURITY;

-- PostgreSQL does not support CREATE POLICY IF NOT EXISTS; drop then create for idempotent runs.
DROP POLICY IF EXISTS menu_item_ratings_select ON menu_item_ratings;
DROP POLICY IF EXISTS menu_item_ratings_insert ON menu_item_ratings;
DROP POLICY IF EXISTS menu_item_ratings_update ON menu_item_ratings;
CREATE POLICY menu_item_ratings_select ON menu_item_ratings FOR SELECT USING (true);
CREATE POLICY menu_item_ratings_insert ON menu_item_ratings FOR INSERT WITH CHECK (true);
CREATE POLICY menu_item_ratings_update ON menu_item_ratings FOR UPDATE USING (true);

DROP POLICY IF EXISTS cafeteria_reviews_select ON cafeteria_reviews;
DROP POLICY IF EXISTS cafeteria_reviews_insert ON cafeteria_reviews;
DROP POLICY IF EXISTS cafeteria_reviews_update ON cafeteria_reviews;
CREATE POLICY cafeteria_reviews_select ON cafeteria_reviews FOR SELECT USING (true);
CREATE POLICY cafeteria_reviews_insert ON cafeteria_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY cafeteria_reviews_update ON cafeteria_reviews FOR UPDATE USING (true);
