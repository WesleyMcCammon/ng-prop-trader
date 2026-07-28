-- Mocked sponsored-ad content, one set per page placement.
-- Sources:
--   home_sponsored → src/app/features/home/home.component.ts (MOCK_ADS)
--   home_strip     → src/app/features/home/home.component.ts (MOCK_STRIP_ADS)
--   home_banner    → src/app/features/home/home.component.ts (MOCK_BANNER_ADS)
--   market         → src/app/features/market/market.component.ts (MARKET_ADS)
--   instruments    → src/app/features/instruments/instruments.component.ts (INSTRUMENT_ADS)
--   indicators     → src/app/features/indicators/indicators.component.ts (INDICATOR_ADS)
--   news_alerts    → src/app/features/news-alerts/news-alerts.component.ts (NEWS_ADS)

INSERT INTO mock_ads (id, placement, sponsor, headline, body, cta, sort_order) VALUES
  (1,  'home_sponsored', 'FundedNext',            'Get Funded up to $200K',           'Pass our challenge and trade with our capital. No risk to your own funds.', 'Start Challenge', 1),
  (2,  'home_sponsored', 'TradingView',           'Chart Like a Pro',                 'Advanced charting tools trusted by millions of traders worldwide.', 'Try Free', 2),
  (3,  'home_sponsored', 'Apex Capital',          '90% Profit Split',                 'Keep more of what you earn with our industry-leading payout structure.', 'Learn More', 3),

  (4,  'home_strip',     'Topstep',               'Trade Our Money',                  'Earn a funded futures account by proving your strategy in our trading combine.', 'Get Started', 1),
  (5,  'home_strip',     'Interactive Brokers',   'Low-Cost Global Access',           'Trade stocks, options, and futures across 150 markets from one account.', 'Open Account', 2),
  (6,  'home_strip',     'MetaTrader 5',          'Multi-Asset Trading Platform',     'Advanced order types and one-click trading for forex, stocks, and futures.', 'Download', 3),

  (7,  'home_banner',    'NinjaTrader',           'Free Trading Simulator',           'Practice risk-free with real-time market data before you trade live.', 'Download Free', 1),
  (8,  'home_banner',    'TraderSync',            'Know Your Edge',                   'Automated trade journaling and analytics that show you what actually works.', 'Start Trial', 2),
  (9,  'home_banner',    'Velocity VPS',          '99.9% Uptime for Your Bots',       'Ultra-low latency hosting built for algorithmic traders. 1ms to major exchanges.', 'Get Hosting', 3),

  (10, 'market',         'Bloomberg Terminal',    'The Trusted Data Standard',        'Real-time quotes, news, and analytics used by professional trading desks worldwide.', 'Request Demo', 1),
  (11, 'market',         'Tradovate',             'Commission-Free Futures',          'Trade futures with no per-contract fees on our flat-rate monthly plans.', 'Open Account', 2),
  (12, 'market',         'Benzinga Pro',          'Move Faster Than the Market',      'Breaking news and squawk alerts delivered seconds before the headlines hit.', 'Try Free', 3),

  (13, 'instruments',    'AMP Futures',           'Low Day-Trading Margins',          'Trade futures with some of the lowest intraday margin requirements in the industry.', 'Open Account', 1),
  (14, 'instruments',    'Tradovate',             'Commission-Free Futures',          'Flat-rate monthly plans with no per-contract fees on every trade.', 'Learn More', 2),
  (15, 'instruments',    'NinjaTrader Brokerage', 'Trade Smarter, Not Harder',        'Award-winning platform with deep discounts on futures commissions.', 'Get Started', 3),

  (16, 'indicators',     'TrendSpider',           'Automated Technical Analysis',     'Auto-detect trendlines, support/resistance, and patterns across every timeframe.', 'Start Free Trial', 1),
  (17, 'indicators',     'Trade Ideas',           'AI-Powered Scanning',              'Let an AI trading assistant surface high-probability setups in real time.', 'See It in Action', 2),
  (18, 'indicators',     'MotiveWave',            'Elliott Wave & Fibonacci Tools',   'Professional-grade analysis tools trusted by technical traders for two decades.', 'Try Free', 3),

  (19, 'news_alerts',    'Benzinga News',         'Breaking News, Seconds Faster',    'Real-time squawk and headline alerts before they hit the wires.', 'Try Free', 1),
  (20, 'news_alerts',    'Forex Factory Premium', 'Never Miss a Catalyst',            'High-impact economic calendar alerts sent straight to your phone.', 'Get Alerts', 2),
  (21, 'news_alerts',    'Trading Economics',     'Global Data at Your Fingertips',   'Macro indicators and forecasts for 196 countries, updated in real time.', 'Explore Data', 3);
