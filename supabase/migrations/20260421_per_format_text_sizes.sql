ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS quote_font_size_1x1 INTEGER NOT NULL DEFAULT 24,
ADD COLUMN IF NOT EXISTS quote_font_size_16x9 INTEGER NOT NULL DEFAULT 32,
ADD COLUMN IF NOT EXISTS quote_font_size_9x16 INTEGER NOT NULL DEFAULT 32,
ADD COLUMN IF NOT EXISTS border_thickness_1x1 INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS border_thickness_16x9 INTEGER NOT NULL DEFAULT 2,
ADD COLUMN IF NOT EXISTS border_thickness_9x16 INTEGER NOT NULL DEFAULT 2;

UPDATE testimonials SET
  quote_font_size_1x1 = quote_font_size,
  quote_font_size_16x9 = quote_font_size,
  quote_font_size_9x16 = quote_font_size,
  border_thickness_1x1 = border_thickness,
  border_thickness_16x9 = border_thickness,
  border_thickness_9x16 = border_thickness;

ALTER TABLE testimonials
DROP COLUMN IF EXISTS quote_font_size,
DROP COLUMN IF EXISTS border_thickness;
