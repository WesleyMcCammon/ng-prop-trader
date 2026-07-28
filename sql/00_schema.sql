-- ============================================================================
-- MarketWatch mock data — schema
-- Dialect: PostgreSQL (NUMERIC/TEXT/CHECK are broadly portable to most RDBMSs
-- with minor tweaks — e.g. swap NUMERIC for DECIMAL on MySQL).
--
-- These tables mirror the hardcoded/mocked data currently embedded in the
-- Angular app's TypeScript source (src/app/data/*.ts, and per-page mock
-- constants). Fields that are *computed* at runtime in the app rather than
-- stored as raw seed data — e.g. instruments.bid/ask/change/high/low/open,
-- which are derived from price/changePct/tickSize/spreadTicks by
-- src/app/data/instruments.data.ts:build() — are intentionally omitted here;
-- only the raw inputs are stored, matching the app's actual source of truth.
-- ============================================================================

-- ── Categories ───────────────────────────────────────────────────────────
CREATE TABLE categories (
  name VARCHAR(20) PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('futures', 'forex', 'cfd'))
);

-- ── Instruments ──────────────────────────────────────────────────────────
CREATE TABLE instruments (
  symbol        VARCHAR(10) PRIMARY KEY,
  name          VARCHAR(60) NOT NULL,
  type          VARCHAR(10) NOT NULL CHECK (type IN ('futures', 'forex', 'cfd')),
  category      VARCHAR(20) NOT NULL REFERENCES categories(name),
  exchange      VARCHAR(10) NOT NULL,
  currency      VARCHAR(3)  NOT NULL,
  contract_size NUMERIC(18,6)  NOT NULL,
  tick_size     NUMERIC(18,10) NOT NULL,
  tick_value    NUMERIC(18,6)  NOT NULL,
  price         NUMERIC(18,6)  NOT NULL,
  change_pct    NUMERIC(8,4)   NOT NULL,
  spread_ticks  INT,
  volume        BIGINT NOT NULL DEFAULT 50000
);

-- ── Indicators ───────────────────────────────────────────────────────────
CREATE TABLE indicator_groups (
  id          VARCHAR(30) PRIMARY KEY,
  name        VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  sort_order  INT NOT NULL
);

CREATE TABLE indicator_levels (
  id          VARCHAR(30) PRIMARY KEY,
  group_id    VARCHAR(30) NOT NULL REFERENCES indicator_groups(id),
  label       VARCHAR(20) NOT NULL,
  name        VARCHAR(60) NOT NULL,
  description TEXT NOT NULL,
  sort_order  INT NOT NULL
);

-- ── Users (demo/mock credentials only — plaintext matches app source) ─────
CREATE TABLE users (
  id       INT PRIMARY KEY,
  name     VARCHAR(60) NOT NULL,
  username VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(60) NOT NULL
);

CREATE TABLE user_roles (
  user_id INT NOT NULL REFERENCES users(id),
  role    VARCHAR(10) NOT NULL CHECK (role IN ('admin', 'forex', 'futures')),
  PRIMARY KEY (user_id, role)
);

-- ── News Alerts: country filter list ───────────────────────────────────────
CREATE TABLE news_alert_countries (
  code       VARCHAR(2) PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  sort_order INT NOT NULL
);

-- ── News Alerts: cyclic severity / relative-time label pools ──────────────
-- (the app cycles through these arrays by index to tag mocked posts)
CREATE TABLE news_alert_severities (
  sort_order INT PRIMARY KEY,
  severity   VARCHAR(10) NOT NULL CHECK (severity IN ('critical', 'high', 'medium'))
);

CREATE TABLE news_alert_times (
  sort_order INT PRIMARY KEY,
  label      VARCHAR(20) NOT NULL
);

-- ── Instruments page: forex currency → country/flag map ───────────────────
CREATE TABLE instrument_countries (
  currency_code VARCHAR(3) PRIMARY KEY,
  flag_code     VARCHAR(2) NOT NULL,
  country_name  VARCHAR(40) NOT NULL
);

-- ── Instruments page: section (futures/forex/cfd) definitions ─────────────
CREATE TABLE sections (
  key   VARCHAR(10) PRIMARY KEY,
  label VARCHAR(20) NOT NULL
);

-- Category display order within each section's grouped table view
CREATE TABLE section_categories (
  section_key   VARCHAR(10) NOT NULL REFERENCES sections(key),
  category_name VARCHAR(20) NOT NULL REFERENCES categories(name),
  sort_order    INT NOT NULL,
  PRIMARY KEY (section_key, category_name)
);

-- ── Mock sponsored ads (per page placement) ────────────────────────────────
CREATE TABLE mock_ads (
  id        INT PRIMARY KEY,
  placement VARCHAR(30) NOT NULL,
  sponsor   VARCHAR(60) NOT NULL,
  headline  VARCHAR(120) NOT NULL,
  body      TEXT NOT NULL,
  cta       VARCHAR(40) NOT NULL,
  sort_order INT NOT NULL
);

-- ── Indicator simulation config ─────────────────────────────────────────────
-- Small hardcoded tables that drive the app's procedural generation of
-- per-instrument indicator values (pivots/VWAP/etc. in indicators.data.ts).
-- The generated values themselves (61 instruments × 39 levels) are computed
-- at runtime from these inputs, not stored as static data — only the raw
-- config literals are seeded here.
CREATE TABLE category_day_range_scale (
  category VARCHAR(20) PRIMARY KEY REFERENCES categories(name),
  scale    NUMERIC(6,4) NOT NULL
);

CREATE TABLE prev_day_sessions (
  sort_order   INT PRIMARY KEY,
  session_date DATE NOT NULL,
  change_pct   NUMERIC(8,4) NOT NULL,
  direction    SMALLINT NOT NULL CHECK (direction IN (-1, 1))
);

CREATE TABLE prev_week_sessions (
  sort_order INT PRIMARY KEY,
  week_of    DATE NOT NULL,
  change_pct NUMERIC(8,4) NOT NULL,
  direction  SMALLINT NOT NULL CHECK (direction IN (-1, 1))
);
