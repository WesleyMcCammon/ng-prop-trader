-- News Alerts country filter list
-- Source: src/app/features/news-alerts/news-alerts.component.ts (COUNTRIES)
INSERT INTO news_alert_countries (code, name, sort_order) VALUES
  ('US', 'United States',  1),
  ('GB', 'United Kingdom', 2),
  ('DE', 'Germany',        3),
  ('JP', 'Japan',          4),
  ('CN', 'China',          5),
  ('FR', 'France',         6),
  ('IN', 'India',          7),
  ('BR', 'Brazil',         8),
  ('CA', 'Canada',         9),
  ('AU', 'Australia',      10),
  ('KR', 'South Korea',    11),
  ('SG', 'Singapore',      12);

-- Instruments page forex currency → country/flag map
-- Source: src/app/features/instruments/instruments.component.ts
-- (CURRENCY_FLAGS + CURRENCY_NAMES)
INSERT INTO instrument_countries (currency_code, flag_code, country_name) VALUES
  ('EUR', 'eu', 'Eurozone'),
  ('USD', 'us', 'United States'),
  ('GBP', 'gb', 'United Kingdom'),
  ('JPY', 'jp', 'Japan'),
  ('CHF', 'ch', 'Switzerland'),
  ('CAD', 'ca', 'Canada'),
  ('AUD', 'au', 'Australia'),
  ('NZD', 'nz', 'New Zealand');
