-- Cyclic pools the app indexes into (post_index % length) to tag mocked
-- news posts with a severity and a relative timestamp.
-- Source: src/app/features/news-alerts/news-alerts.component.ts (SEVERITIES, TIMES)

INSERT INTO news_alert_severities (sort_order, severity) VALUES
  (1, 'critical'),
  (2, 'high'),
  (3, 'high'),
  (4, 'medium'),
  (5, 'medium'),
  (6, 'medium');

INSERT INTO news_alert_times (sort_order, label) VALUES
  (1,  'Just now'),
  (2,  '2 min ago'),
  (3,  '8 min ago'),
  (4,  '15 min ago'),
  (5,  '27 min ago'),
  (6,  '41 min ago'),
  (7,  '1 hr ago'),
  (8,  '1 hr ago'),
  (9,  '2 hrs ago'),
  (10, '2 hrs ago'),
  (11, '3 hrs ago'),
  (12, '4 hrs ago');
