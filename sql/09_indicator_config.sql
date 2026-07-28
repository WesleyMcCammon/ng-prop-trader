-- Source: src/app/data/indicators.data.ts (DAY_RANGE_SCALE, DAY_DATES/
-- DAY_CHG_PCT/DAY_DIR, WEEK_DATES/WEEK_CHG_PCT/WEEK_DIR)
-- These drive the procedural generation of per-instrument indicator levels;
-- the generated levels themselves are computed at runtime, not stored here.

INSERT INTO category_day_range_scale (category, scale) VALUES
  ('Indices',      0.012),
  ('Metals',       0.010),
  ('Energies',     0.015),
  ('Financials',   0.006),
  ('Currencies',   0.008),
  ('Forex Majors', 0.007),
  ('Forex Minors', 0.009),
  ('CFDs',         0.012);

-- Past 5 business days, most recent first (app's "today" = 2026-07-01)
INSERT INTO prev_day_sessions (sort_order, session_date, change_pct, direction) VALUES
  (1, '2026-06-30', -0.0042, -1),
  (2, '2026-06-27',  0.0018,  1),
  (3, '2026-06-26', -0.0063, -1),
  (4, '2026-06-25',  0.0031,  1),
  (5, '2026-06-24', -0.0028, -1);

-- Past 5 week starts (Mondays), most recent first
INSERT INTO prev_week_sessions (sort_order, week_of, change_pct, direction) VALUES
  (1, '2026-06-29', -0.012, -1),
  (2, '2026-06-22',  0.022,  1),
  (3, '2026-06-15', -0.018, -1),
  (4, '2026-06-08',  0.031,  1),
  (5, '2026-06-01', -0.024, -1);
