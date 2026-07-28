-- Source: src/app/core/services/auth.service.ts (MOCK_USERS)
-- Demo credentials only (plaintext passwords match the app's mock source).

INSERT INTO users (id, name, username, password) VALUES
  (1, 'Alice Admin',   'alice', 'pass'),
  (2, 'Frank Forex',   'frank', 'pass'),
  (3, 'Fiona Futures', 'fiona', 'pass'),
  (4, 'Bob Both',      'bob',   'pass');

INSERT INTO user_roles (user_id, role) VALUES
  (1, 'admin'),
  (2, 'forex'),
  (3, 'futures'),
  (4, 'forex'),
  (4, 'futures');
