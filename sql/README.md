# SQL seed data

INSERT statements for every hardcoded/mocked data set in the app's TypeScript
source (`src/app/data/*.ts` and per-feature mock constants). Written for
PostgreSQL; run the files in numeric order (`00_schema.sql` first).

| File | Source |
|---|---|
| `00_schema.sql` | table definitions for everything below |
| `01_categories.sql` | `core/services/category.service.ts` |
| `02_instruments.sql` | `data/instruments.data.ts` (61 rows) |
| `03_indicator_groups.sql` | `features/indicators/indicators.component.ts` (`GROUPS_DEF`) |
| `04_users.sql` | `core/services/auth.service.ts` (`MOCK_USERS`) |
| `05_countries.sql` | News Alerts country list + Instruments forex currency/flag map |
| `06_sections.sql` | Instruments page section + category-order config |
| `07_news_alert_meta.sql` | News Alerts cyclic severity/time label pools |
| `08_mock_ads.sql` | All `MockAd[]` arrays across Home/Market/Instruments/Indicators/News Alerts |
| `09_indicator_config.sql` | `data/indicators.data.ts` simulation config (day/week range scale + session deltas) |

Not included: `instruments.bid/ask/change/high/low/open` and the full
per-instrument indicator level values (61 × 39 numbers) — these are computed
at runtime from the seeded fields (see comments in `00_schema.sql` and
`09_indicator_config.sql`), not stored as independent data in the app.
Also excluded: posts/users fetched live from jsonplaceholder.typicode.com
(`core/services/data.service.ts`) — external API data, not a local mock file.
