-- Enable Realtime on menu_items for live availability updates
-- Also run in Supabase Dashboard → Database → Replication if this alone is insufficient.

ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
