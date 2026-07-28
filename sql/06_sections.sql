-- Source: src/app/features/instruments/instruments.component.ts
-- (SECTION_DEFS + CATEGORY_ORDER)

INSERT INTO sections (key, label) VALUES
  ('futures', 'Futures'),
  ('forex',   'Forex'),
  ('cfd',     'CFD');

INSERT INTO section_categories (section_key, category_name, sort_order) VALUES
  ('futures', 'Indices',      1),
  ('futures', 'Metals',       2),
  ('futures', 'Energies',     3),
  ('futures', 'Financials',   4),
  ('futures', 'Currencies',   5),
  ('forex',   'Forex Majors', 1),
  ('forex',   'Forex Minors', 2);
  -- 'cfd' section has no sub-category grouping (CATEGORY_ORDER.cfd = [])
