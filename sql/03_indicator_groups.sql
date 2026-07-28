-- Source: src/app/features/indicators/indicators.component.ts (GROUPS_DEF)
-- 6 groups, 35 levels total.

INSERT INTO indicator_groups (id, name, description, sort_order) VALUES
  ('pivots',       'Pivots',           'Classic floor-trader pivot points calculated from the prior session’s high, low, and close.', 1),
  ('vwap',         'VWAP',             'Volume-weighted average price and standard deviation bands for the current session.', 2),
  ('volumeProfile','Volume Profile',   'Price levels where the most trading volume occurred during the session.', 3),
  ('openingRange', 'Opening Range',    'The high and low of the opening range window at the start of the session.', 4),
  ('prevDayOHLC',  'Prev Day OHLC',    'Open, high, low, and close from the prior session’s Asia, London, and New York windows.', 5),
  ('weeklyOHLC',   'Weekly OHLC',      'Open, high, low, and close from the prior trading week.', 6);

-- Pivots (7)
INSERT INTO indicator_levels (id, group_id, label, name, description, sort_order) VALUES
  ('pivots.r3',    'pivots', 'R3',    'R3',    'Third resistance level, furthest above the pivot.', 1),
  ('pivots.r2',    'pivots', 'R2',    'R2',    'Second resistance level above the pivot.', 2),
  ('pivots.r1',    'pivots', 'R1',    'R1',    'First resistance level above the pivot.', 3),
  ('pivots.pivot', 'pivots', 'Pivot', 'Pivot', 'Central pivot point, the average of the prior session’s high, low, and close.', 4),
  ('pivots.s1',    'pivots', 'S1',    'S1',    'First support level below the pivot.', 5),
  ('pivots.s2',    'pivots', 'S2',    'S2',    'Second support level below the pivot.', 6),
  ('pivots.s3',    'pivots', 'S3',    'S3',    'Third support level, furthest below the pivot.', 7);

-- VWAP (7)
INSERT INTO indicator_levels (id, group_id, label, name, description, sort_order) VALUES
  ('vwap.sd3',  'vwap', 'SD +3', 'Standard Deviation +3',              'VWAP plus three standard deviations.', 1),
  ('vwap.sd2',  'vwap', 'SD +2', 'Standard Deviation +2',              'VWAP plus two standard deviations.', 2),
  ('vwap.sd1',  'vwap', 'SD +1', 'Standard Deviation +1',              'VWAP plus one standard deviation.', 3),
  ('vwap.vwap', 'vwap', 'VWAP',  'Volume Weighted Average Price',      'Volume-weighted average price for the current session.', 4),
  ('vwap.sm1',  'vwap', 'SD -1', 'Standard Deviation -1',              'VWAP minus one standard deviation.', 5),
  ('vwap.sm2',  'vwap', 'SD -2', 'Standard Deviation -2',              'VWAP minus two standard deviations.', 6),
  ('vwap.sm3',  'vwap', 'SD -3', 'Standard Deviation -3',              'VWAP minus three standard deviations.', 7);

-- Volume Profile (3)
INSERT INTO indicator_levels (id, group_id, label, name, description, sort_order) VALUES
  ('vp.vah', 'volumeProfile', 'VAH', 'Value Area High',  'Top of the range containing the bulk of traded volume.', 1),
  ('vp.poc', 'volumeProfile', 'POC', 'Point of Control',  'The single price level with the highest traded volume.', 2),
  ('vp.val', 'volumeProfile', 'VAL', 'Value Area Low',   'Bottom of the range containing the bulk of traded volume.', 3);

-- Opening Range (2)
INSERT INTO indicator_levels (id, group_id, label, name, description, sort_order) VALUES
  ('or.high', 'openingRange', 'High', 'High', 'High of the opening range window.', 1),
  ('or.low',  'openingRange', 'Low',  'Low',  'Low of the opening range window.', 2);

-- Prev Day OHLC (12: Asia/London/New York × O/H/L/C)
INSERT INTO indicator_levels (id, group_id, label, name, description, sort_order) VALUES
  ('pd.asia.open',  'prevDayOHLC', 'Asia Open',     'Asia Open',     'Opening price during the prior session’s Asia trading window.', 1),
  ('pd.asia.high',  'prevDayOHLC', 'Asia High',     'Asia High',     'High price during the prior session’s Asia trading window.', 2),
  ('pd.asia.low',   'prevDayOHLC', 'Asia Low',      'Asia Low',      'Low price during the prior session’s Asia trading window.', 3),
  ('pd.asia.close', 'prevDayOHLC', 'Asia Close',    'Asia Close',    'Closing price during the prior session’s Asia trading window.', 4),
  ('pd.lon.open',   'prevDayOHLC', 'London Open',   'London Open',   'Opening price during the prior session’s London trading window.', 5),
  ('pd.lon.high',   'prevDayOHLC', 'London High',   'London High',   'High price during the prior session’s London trading window.', 6),
  ('pd.lon.low',    'prevDayOHLC', 'London Low',    'London Low',    'Low price during the prior session’s London trading window.', 7),
  ('pd.lon.close',  'prevDayOHLC', 'London Close',  'London Close',  'Closing price during the prior session’s London trading window.', 8),
  ('pd.ny.open',    'prevDayOHLC', 'New York Open',  'New York Open',  'Opening price during the prior session’s New York trading window.', 9),
  ('pd.ny.high',    'prevDayOHLC', 'New York High',  'New York High',  'High price during the prior session’s New York trading window.', 10),
  ('pd.ny.low',     'prevDayOHLC', 'New York Low',   'New York Low',   'Low price during the prior session’s New York trading window.', 11),
  ('pd.ny.close',   'prevDayOHLC', 'New York Close', 'New York Close', 'Closing price during the prior session’s New York trading window.', 12);

-- Weekly OHLC (4)
INSERT INTO indicator_levels (id, group_id, label, name, description, sort_order) VALUES
  ('wk.open',  'weeklyOHLC', 'Open',  'Open',  'Opening price of the prior trading week.', 1),
  ('wk.high',  'weeklyOHLC', 'High',  'High',  'High price of the prior trading week.', 2),
  ('wk.low',   'weeklyOHLC', 'Low',   'Low',   'Low price of the prior trading week.', 3),
  ('wk.close', 'weeklyOHLC', 'Close', 'Close', 'Closing price of the prior trading week.', 4);
