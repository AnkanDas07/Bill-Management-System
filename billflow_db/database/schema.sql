CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE bill_status AS ENUM ('Paid', 'Pending', 'Overdue');

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'admin';

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  total_bills INTEGER NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name, email)
);

CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(150) NOT NULL,
  bill_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status bill_status NOT NULL DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

INSERT INTO customers (name, email, phone, total_bills, total_amount)
VALUES
  ('Acme Corporation', 'billing@acmecorp.com', '+1 (555) 100-2000', 2, 10000.00),
  ('TechStart Inc', 'accounts@techstart.io', '+1 (555) 201-3000', 1, 3500.00),
  ('Global Solutions Ltd', 'finance@globalsol.com', '+1 (555) 302-4000', 1, 4200.00)
ON CONFLICT (name, email) DO NOTHING;

INSERT INTO bills (invoice_number, customer_id, customer_name, bill_date, amount, status, notes)
VALUES
  ('INV-001', 1, 'Acme Corporation', '2026-09-01', 2500.00, 'Paid', 'Website maintenance'),
  ('INV-002', 2, 'TechStart Inc', '2026-09-05', 3500.00, 'Pending', 'Subscription renewal'),
  ('INV-003', 3, 'Global Solutions Ltd', '2026-09-10', 4200.00, 'Overdue', 'Consulting invoice'),
  ('INV-004', 1, 'Acme Corporation', '2026-09-15', 7500.00, 'Paid', 'Retainer fee')
ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO bill_items (bill_id, description, quantity, price)
VALUES
  ((SELECT id FROM bills WHERE invoice_number = 'INV-001'), 'Website maintenance', 1, 2500.00),
  ((SELECT id FROM bills WHERE invoice_number = 'INV-002'), 'Cloud plan', 1, 3500.00),
  ((SELECT id FROM bills WHERE invoice_number = 'INV-003'), 'Consulting hours', 10, 420.00),
  ((SELECT id FROM bills WHERE invoice_number = 'INV-004'), 'Retainer', 1, 7500.00)
ON CONFLICT DO NOTHING;

UPDATE customers
SET total_bills = (
  SELECT COUNT(*) FROM bills WHERE bills.customer_id = customers.id
),
    total_amount = (
  SELECT COALESCE(SUM(amount), 0) FROM bills WHERE bills.customer_id = customers.id
);

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Admin User', 'admin@billflow.com', '$2a$10$8X3v2Ns0j1tUWe0lR8cQ8e6cjTg5u2qYMIpYSDTPhj5ztgY6v4s5m', 'admin')
ON CONFLICT (email) DO NOTHING;
