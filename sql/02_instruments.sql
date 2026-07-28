-- Source: src/app/data/instruments.data.ts (INSTRUMENTS, 61 rows)
-- Note: bid/ask/change/high/low/open are computed at runtime by build() from
-- price/change_pct/tick_size/spread_ticks — not stored here (see 00_schema.sql).

-- ── Futures – Indices (8) ──────────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('/ES',  'E-mini S&P 500',           'futures', 'Indices', 'CME',  'USD', 50,   0.25, 12.50, 5480.25,   0.42, NULL, 980000),
  ('/NQ',  'E-mini NASDAQ-100',        'futures', 'Indices', 'CME',  'USD', 20,   0.25, 5.00,  19612.50,  0.67, NULL, 420000),
  ('/YM',  'E-mini Dow',               'futures', 'Indices', 'CBOT', 'USD', 5,    1,    5.00,  43215,    -0.12, NULL, 140000),
  ('/RTY', 'E-mini Russell 2000',      'futures', 'Indices', 'CME',  'USD', 50,   0.10, 5.00,  2098.40,   0.48, NULL, 85000),
  ('/MES', 'Micro E-mini S&P 500',     'futures', 'Indices', 'CME',  'USD', 5,    0.25, 1.25,  5480.25,   0.42, NULL, 620000),
  ('/MNQ', 'Micro E-mini NASDAQ-100',  'futures', 'Indices', 'CME',  'USD', 2,    0.25, 0.50,  19612.50,  0.67, NULL, 310000),
  ('/MYM', 'Micro E-mini Dow',         'futures', 'Indices', 'CBOT', 'USD', 0.5,  1,    0.50,  43215,    -0.12, NULL, 72000),
  ('/M2K', 'Micro E-mini Russell 2000','futures', 'Indices', 'CME',  'USD', 5,    0.10, 0.50,  2098.40,   0.48, NULL, 48000);

-- ── Futures – Metals (7) ───────────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('/GC',  'Gold',         'futures', 'Metals', 'COMEX', 'USD', 100,   0.10,   10.00, 3248.60,  0.38, NULL, 210000),
  ('/SI',  'Silver',       'futures', 'Metals', 'COMEX', 'USD', 5000,  0.005,  25.00, 32.485,   0.72, NULL, 95000),
  ('/HG',  'Copper',       'futures', 'Metals', 'COMEX', 'USD', 25000, 0.0005, 12.50, 4.6240,  -0.21, NULL, 62000),
  ('/PL',  'Platinum',     'futures', 'Metals', 'NYMEX', 'USD', 50,    0.10,   5.00,  1018.50,  0.15, NULL, 18000),
  ('/PA',  'Palladium',    'futures', 'Metals', 'NYMEX', 'USD', 100,   0.05,   5.00,  1124.00, -0.44, NULL, 6000),
  ('/MGC', 'Micro Gold',   'futures', 'Metals', 'COMEX', 'USD', 10,    0.10,   1.00,  3248.60,  0.38, NULL, 145000),
  ('/SIL', 'Micro Silver', 'futures', 'Metals', 'COMEX', 'USD', 1000,  0.005,  5.00,  32.485,   0.72, NULL, 38000);

-- ── Futures – Energies (6) ─────────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('/CL',  'Crude Oil WTI',   'futures', 'Energies', 'NYMEX', 'USD', 1000,  0.01,   10.00, 78.42,  -0.83, NULL, 480000),
  ('/BRN', 'Brent Crude Oil', 'futures', 'Energies', 'ICE',   'USD', 1000,  0.01,   10.00, 82.18,  -0.61, NULL, 340000),
  ('/NG',  'Natural Gas',     'futures', 'Energies', 'NYMEX', 'USD', 10000, 0.001,  10.00, 2.847,   1.24, NULL, 220000),
  ('/HO',  'Heating Oil',     'futures', 'Energies', 'NYMEX', 'USD', 42000, 0.0001, 4.20,  2.4483, -0.52, NULL, 55000),
  ('/RB',  'RBOB Gasoline',   'futures', 'Energies', 'NYMEX', 'USD', 42000, 0.0001, 4.20,  2.6851, -0.34, NULL, 62000),
  ('/MCL', 'Micro Crude Oil', 'futures', 'Energies', 'NYMEX', 'USD', 100,   0.01,   1.00,  78.42,  -0.83, NULL, 120000);

-- ── Futures – Financials (5) ───────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('/ZN', '10-Year T-Note',   'futures', 'Financials', 'CBOT', 'USD', 100000,  0.015625,   15.625, 109.515625, 0.18, NULL, 1200000),
  ('/ZB', '30-Year T-Bond',   'futures', 'Financials', 'CBOT', 'USD', 100000,  0.03125,    31.25,  116.09375,  0.22, NULL, 420000),
  ('/ZF', '5-Year T-Note',    'futures', 'Financials', 'CBOT', 'USD', 100000,  0.0078125,  7.8125, 106.453125, 0.11, NULL, 680000),
  ('/ZT', '2-Year T-Note',    'futures', 'Financials', 'CBOT', 'USD', 200000,  0.0078125,  15.625, 102.78125,  0.07, NULL, 310000),
  ('/ZQ', '30-Day Fed Funds', 'futures', 'Financials', 'CBOT', 'USD', 5000000, 0.005,      20.833, 95.4125,    0.01, NULL, 140000);

-- ── Futures – Currencies (14: 7 standard + 7 micro) ────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('/6E', 'Euro FX',                  'futures', 'Currencies', 'CME', 'USD', 125000,    0.00005,   6.25,  1.08545,  0.23, NULL, 240000),
  ('/6B', 'British Pound',            'futures', 'Currencies', 'CME', 'USD', 62500,     0.0001,    6.25,  1.27185,  0.14, NULL, 115000),
  ('/6J', 'Japanese Yen',             'futures', 'Currencies', 'CME', 'USD', 12500000,  0.0000005, 6.25,  0.006582,-0.18, NULL, 98000),
  ('/6A', 'Australian Dollar',        'futures', 'Currencies', 'CME', 'USD', 100000,    0.0001,    10.00, 0.64820,  0.31, NULL, 72000),
  ('/6C', 'Canadian Dollar',          'futures', 'Currencies', 'CME', 'USD', 100000,    0.0001,    10.00, 0.73215, -0.08, NULL, 54000),
  ('/6S', 'Swiss Franc',              'futures', 'Currencies', 'CME', 'USD', 125000,    0.0001,    12.50, 1.12385,  0.19, NULL, 42000),
  ('/6N', 'New Zealand Dollar',       'futures', 'Currencies', 'CME', 'USD', 100000,    0.0001,    10.00, 0.59840,  0.25, NULL, 28000),
  ('/M6E','Micro Euro FX',            'futures', 'Currencies', 'CME', 'USD', 12500,     0.0001,    1.25,  1.08545,  0.23, NULL, 180000),
  ('/M6B','Micro British Pound',      'futures', 'Currencies', 'CME', 'USD', 6250,      0.0001,    0.625, 1.27185,  0.14, NULL, 88000),
  ('/M6J','Micro Japanese Yen',       'futures', 'Currencies', 'CME', 'USD', 1250000,   0.000001,  1.25,  0.006582,-0.18, NULL, 62000),
  ('/M6A','Micro Australian Dollar',  'futures', 'Currencies', 'CME', 'USD', 10000,     0.0001,    1.00,  0.64820,  0.31, NULL, 55000),
  ('/M6C','Micro Canadian Dollar',    'futures', 'Currencies', 'CME', 'USD', 10000,     0.0001,    1.00,  0.73215, -0.08, NULL, 38000),
  ('/M6S','Micro Swiss Franc',        'futures', 'Currencies', 'CME', 'USD', 12500,     0.0001,    1.25,  1.12385,  0.19, NULL, 32000),
  ('/M6N','Micro New Zealand Dollar', 'futures', 'Currencies', 'CME', 'USD', 10000,     0.0001,    1.00,  0.59840,  0.25, NULL, 22000);

-- ── Forex – Majors (7) ─────────────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('EUR/USD', 'Euro / US Dollar',              'forex', 'Forex Majors', 'OTC', 'USD', 100000, 0.00001, 1.00, 1.08548,  0.23, 10, 0),
  ('GBP/USD', 'British Pound / US Dollar',      'forex', 'Forex Majors', 'OTC', 'USD', 100000, 0.00001, 1.00, 1.27192,  0.14, 15, 0),
  ('USD/JPY', 'US Dollar / Japanese Yen',       'forex', 'Forex Majors', 'OTC', 'JPY', 100000, 0.001,   1.00, 152.418, -0.18, 9,  0),
  ('USD/CHF', 'US Dollar / Swiss Franc',        'forex', 'Forex Majors', 'OTC', 'CHF', 100000, 0.00001, 1.00, 0.88962, -0.19, 12, 0),
  ('USD/CAD', 'US Dollar / Canadian Dollar',    'forex', 'Forex Majors', 'OTC', 'CAD', 100000, 0.00001, 1.00, 1.36584,  0.08, 15, 0),
  ('AUD/USD', 'Australian Dollar / US Dollar',  'forex', 'Forex Majors', 'OTC', 'USD', 100000, 0.00001, 1.00, 0.64817,  0.31, 15, 0),
  ('NZD/USD', 'New Zealand Dollar / US Dollar', 'forex', 'Forex Majors', 'OTC', 'USD', 100000, 0.00001, 1.00, 0.59843,  0.25, 20, 0);

-- ── Forex – Minors (6) ─────────────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('EUR/GBP', 'Euro / British Pound',             'forex', 'Forex Minors', 'OTC', 'GBP', 100000, 0.00001, 1.00, 0.85342,  0.09, 20, 0),
  ('EUR/JPY', 'Euro / Japanese Yen',               'forex', 'Forex Minors', 'OTC', 'JPY', 100000, 0.001,   1.00, 165.412,  0.05, 15, 0),
  ('GBP/JPY', 'British Pound / Japanese Yen',      'forex', 'Forex Minors', 'OTC', 'JPY', 100000, 0.001,   1.00, 193.762, -0.04, 20, 0),
  ('AUD/JPY', 'Australian Dollar / Japanese Yen',  'forex', 'Forex Minors', 'OTC', 'JPY', 100000, 0.001,   1.00, 98.842,   0.13, 22, 0),
  ('EUR/CHF', 'Euro / Swiss Franc',                'forex', 'Forex Minors', 'OTC', 'CHF', 100000, 0.00001, 1.00, 0.96418,  0.04, 25, 0),
  ('CAD/JPY', 'Canadian Dollar / Japanese Yen',    'forex', 'Forex Minors', 'OTC', 'JPY', 100000, 0.001,   1.00, 111.628, -0.10, 22, 0);

-- ── CFDs (8) ───────────────────────────────────────────────────────────────
INSERT INTO instruments (symbol, name, type, category, exchange, currency, contract_size, tick_size, tick_value, price, change_pct, spread_ticks, volume) VALUES
  ('US500',  'US 500 (S&P 500)',      'cfd', 'CFDs', 'OTC', 'USD', 1, 0.1,   0.10,  5479.8,    0.42, 4,  0),
  ('USTEC',  'US Tech 100 (NASDAQ)',  'cfd', 'CFDs', 'OTC', 'USD', 1, 0.1,   0.10,  19608.5,   0.67, 5,  0),
  ('US30',   'US 30 (Dow Jones)',     'cfd', 'CFDs', 'OTC', 'USD', 1, 1,     1.00,  43212,    -0.12, 3,  0),
  ('XAUUSD', 'Gold (Spot)',           'cfd', 'CFDs', 'OTC', 'USD', 1, 0.01,  0.01,  3247.42,   0.38, 35, 0),
  ('WTIUSD', 'Crude Oil WTI (Spot)',  'cfd', 'CFDs', 'OTC', 'USD', 1, 0.001, 0.001, 78.384,   -0.83, 30, 0),
  ('BRTUSD', 'Brent Crude (Spot)',    'cfd', 'CFDs', 'OTC', 'USD', 1, 0.001, 0.001, 82.147,   -0.61, 35, 0),
  ('NGAS',   'Natural Gas (Spot)',    'cfd', 'CFDs', 'OTC', 'USD', 1, 0.001, 0.001, 2.8462,    1.24, 50, 0),
  ('XAGUSD', 'Silver (Spot)',         'cfd', 'CFDs', 'OTC', 'USD', 1, 0.001, 0.001, 32.452,    0.72, 50, 0);
