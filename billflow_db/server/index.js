const express = require('express')
const cors = require('cors')
const { Client } = require('pg')
const dotenv = require('dotenv')

dotenv.config({ path: __dirname + '/.env' })

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

const ensureSchema = async () => {
  try {
    const billTypeExists = await client.query(
      "SELECT 1 FROM pg_type WHERE typname = 'bill_status'"
    )
    if (billTypeExists.rowCount === 0) {
      await client.query("CREATE TYPE bill_status AS ENUM ('Paid', 'Pending', 'Overdue')")
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'admin',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        total_bills INTEGER NOT NULL DEFAULT 0,
        total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, name),
        UNIQUE (user_id, email)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) NOT NULL,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        customer_name VARCHAR(150) NOT NULL,
        bill_date DATE NOT NULL,
        amount NUMERIC(12,2) NOT NULL DEFAULT 0,
        status bill_status NOT NULL DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, invoice_number)
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS bill_items (
        id SERIAL PRIMARY KEY,
        bill_id INTEGER NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
        price NUMERIC(12,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    const columns = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    )
    const userColumns = new Set(columns.rows.map((row) => row.column_name))
    if (!userColumns.has('role')) {
      await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(30) NOT NULL DEFAULT 'admin'")
    }

    const customersColumns = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers'"
    )
    const customerColumns = new Set(customersColumns.rows.map((row) => row.column_name))
    if (!customerColumns.has('user_id')) {
      await client.query("ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id INTEGER")
    }

    const billsColumns = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bills'"
    )
    const billColumns = new Set(billsColumns.rows.map((row) => row.column_name))
    if (!billColumns.has('user_id')) {
      await client.query("ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_id INTEGER")
    }

    const customerType = await client.query(
      "SELECT data_type FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'user_id'"
    )
    const customerUserIdType = customerType.rows[0]?.data_type
    if (customerUserIdType && customerUserIdType !== 'integer') {
      await client.query("UPDATE customers SET user_id = NULL WHERE user_id IS NOT NULL AND user_id::text !~ '^[0-9]+$'")
      await client.query("ALTER TABLE customers ALTER COLUMN user_id TYPE INTEGER USING NULLIF(user_id::text, '')::INTEGER")
    }

    const billType = await client.query(
      "SELECT data_type FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'user_id'"
    )
    const billUserIdType = billType.rows[0]?.data_type
    if (billUserIdType && billUserIdType !== 'integer') {
      await client.query("UPDATE bills SET user_id = NULL WHERE user_id IS NOT NULL AND user_id::text !~ '^[0-9]+$'")
      await client.query("ALTER TABLE bills ALTER COLUMN user_id TYPE INTEGER USING NULLIF(user_id::text, '')::INTEGER")
    }

    await client.query("CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id)")
    await client.query("CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id)")
    await client.query("CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status)")
    await client.query("CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id)")
    await client.query("CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)")

    console.log('Database schema check complete.')
  } catch (error) {
    console.error('Schema check failed:', error.message)
  }
}

client.connect()
  .then(() => ensureSchema())
  .catch((error) => {
    console.error('Database connection failed:', error.message)
  })

const sanitizeUser = (user) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  companyName: user.company_name || '',
  phone: user.phone || '',
})

const parseUserId = (userId) => {
  const value = String(userId ?? '').trim()
  if (!value) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getUserById = async (userId) => {
  const normalizedId = parseUserId(userId)
  if (normalizedId === null) return null

  const result = await client.query(
    'SELECT id, name, email, password_hash, COALESCE(role, \'admin\') AS role FROM users WHERE id = $1 LIMIT 1',
    [normalizedId]
  )
  return result.rows[0] || null
}

const requireUserId = async (req, res) => {
  const rawUserId = req.headers['x-user-id'] || req.body?.userId
  const userId = parseUserId(rawUserId)
  if (userId === null) {
    res.status(401).json({ message: 'User session required.' })
    return null
  }

  const user = await getUserById(userId)
  if (!user) {
    res.status(401).json({ message: 'User not found.' })
    return null
  }

  return user
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, companyName, phone } = req.body || {}

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required.' })
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase()
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, name, email, COALESCE(role, 'admin') AS role, created_at`,
      [String(name).trim(), normalizedEmail, String(password)]
    )

    const user = result.rows[0]
    return res.status(201).json({
      message: 'User registered successfully.',
      user: sanitizeUser({ ...user, company_name: companyName || '', phone: phone || '' }),
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: 'Unable to create account.' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase()
    const result = await client.query(
      'SELECT id, name, email, password_hash, COALESCE(role, \'admin\') AS role FROM users WHERE email = $1',
      [normalizedEmail]
    )

    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const passwordMatches = String(password) === String(user.password_hash)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: sanitizeUser(user),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Login failed.' })
  }
})

app.get('/api/bills', async (req, res) => {
  const user = await requireUserId(req, res)
  if (!user) return

  try {
    const result = await client.query(
      `SELECT * FROM bills WHERE user_id = $1 ORDER BY created_at DESC`,
      [Number(user.id)]
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Fetch bills error:', error)
    return res.status(500).json({ message: 'Unable to fetch bills.' })
  }
})

app.post('/api/bills', async (req, res) => {
  const user = await requireUserId(req, res)
  if (!user) return

  const { invoiceNumber, customerName, date, amount, status, notes } = req.body || {}

  if (!invoiceNumber || !customerName || !date || amount === undefined) {
    return res.status(400).json({ message: 'Invoice number, customer, date and amount are required.' })
  }

  try {
    const result = await client.query(
      `INSERT INTO bills (user_id, invoice_number, customer_name, bill_date, amount, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [Number(user.id), String(invoiceNumber), String(customerName), String(date), Number(amount), status || 'Pending', notes || '']
    )
    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create bill error:', error)
    return res.status(500).json({ message: 'Unable to create bill.' })
  }
})

app.patch('/api/bills/:id/status', async (req, res) => {
  const user = await requireUserId(req, res)
  if (!user) return

  const { id } = req.params
  const { status } = req.body || {}

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' })
  }

  try {
    const result = await client.query(
      `UPDATE bills
       SET status = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [String(status), id, Number(user.id)]
    )

    if (!result.rowCount) {
      return res.status(404).json({ message: 'Bill not found for this user.' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Update bill status error:', error)
    return res.status(500).json({ message: 'Unable to update bill status.' })
  }
})

app.get('/api/customers', async (req, res) => {
  const user = await requireUserId(req, res)
  if (!user) return

  try {
    const result = await client.query(
      `SELECT * FROM customers WHERE user_id = $1 ORDER BY created_at DESC`,
      [Number(user.id)]
    )
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error('Fetch customers error:', error)
    return res.status(500).json({ message: 'Unable to fetch customers.' })
  }
})

app.post('/api/customers', async (req, res) => {
  const user = await requireUserId(req, res)
  if (!user) return

  const { name, email, phone } = req.body || {}

  if (!name) {
    return res.status(400).json({ message: 'Customer name is required.' })
  }

  try {
    const result = await client.query(
      `INSERT INTO customers (user_id, name, email, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [Number(user.id), String(name), email || null, phone || null]
    )
    return res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create customer error:', error)
    return res.status(500).json({ message: 'Unable to create customer.' })
  }
})

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

module.exports = { app, client }

if (require.main === module) {
  app.listen(port, () => {
    console.log(`BillFlow server running on http://localhost:${port}`)
  })
}
