CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote TEXT NOT NULL DEFAULT '',
  client_name TEXT NOT NULL DEFAULT '',
  client_role TEXT NOT NULL DEFAULT '',
  badge_text TEXT NOT NULL DEFAULT '',
  logo_text TEXT NOT NULL DEFAULT '',
  logo_image TEXT,
  avatar_image TEXT,
  app_screenshot TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  quote_font_size INTEGER NOT NULL DEFAULT 24,
  format TEXT NOT NULL DEFAULT '1x1',
  accent_theme_name TEXT NOT NULL DEFAULT 'Purple',
  background_mode TEXT NOT NULL DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON testimonials;
CREATE POLICY "Allow public read access"
  ON testimonials FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public insert access" ON testimonials;
CREATE POLICY "Allow public insert access"
  ON testimonials FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access" ON testimonials;
CREATE POLICY "Allow public update access"
  ON testimonials FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow public delete access" ON testimonials;
CREATE POLICY "Allow public delete access"
  ON testimonials FOR DELETE
  USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE testimonials;
