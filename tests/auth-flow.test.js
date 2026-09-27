import test from 'node:test'
import assert from 'node:assert/strict'

const appModule = await import('../billflow_db/server/index.js')
const { app } = appModule

const startServer = async () => {
  const server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  return { server, baseUrl: `http://127.0.0.1:${port}` }
}

test('registers a user successfully', async () => {
  const { server, baseUrl } = await startServer()

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: '12345678',
        companyName: 'Test Co',
        phone: '1234567890',
      }),
    })

    const payload = await response.json()
    assert.equal(response.status, 201)
    assert.equal(payload.message, 'User registered successfully.')
    assert.ok(payload.user.id)
    assert.equal(payload.user.email, payload.user.email)
  } finally {
    server.close()
  }
})

test('does not allow duplicate email registration', async () => {
  const { server, baseUrl } = await startServer()

  try {
    const email = `dup-${Date.now()}@example.com`

    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'First User',
        email,
        password: '12345678',
        companyName: 'Dup Co',
        phone: '1111111111',
      }),
    })

    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second User',
        email,
        password: '87654321',
        companyName: 'Other Co',
        phone: '2222222222',
      }),
    })

    const payload = await response.json()
    assert.equal(response.status, 409)
    assert.equal(payload.message, 'An account with this email already exists.')
  } finally {
    server.close()
  }
})

test('fresh user starts with empty bills and customers', async () => {
  const { server, baseUrl } = await startServer()

  try {
    const email = `empty-${Date.now()}@example.com`
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Empty User',
        email,
        password: '12345678',
        companyName: 'Empty Co',
        phone: '3333333333',
      }),
    })

    const user = (await registerResponse.json()).user
    const billsResponse = await fetch(`${baseUrl}/api/bills`, {
      headers: { 'x-user-id': String(user.id) },
    })
    const customersResponse = await fetch(`${baseUrl}/api/customers`, {
      headers: { 'x-user-id': String(user.id) },
    })

    assert.equal(billsResponse.status, 200)
    assert.equal(customersResponse.status, 200)
    assert.deepEqual(await billsResponse.json(), [])
    assert.deepEqual(await customersResponse.json(), [])
  } finally {
    server.close()
  }
})

test('keeps bill data isolated per user', async () => {
  const { server, baseUrl } = await startServer()

  try {
    const user1 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User One',
        email: `u1-${Date.now()}@example.com`,
        password: '12345678',
        companyName: 'One Co',
        phone: '1111111111',
      }),
    }).then((r) => r.json())

    const user2 = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'User Two',
        email: `u2-${Date.now()}@example.com`,
        password: '12345678',
        companyName: 'Two Co',
        phone: '2222222222',
      }),
    }).then((r) => r.json())

    const billCreate1 = await fetch(`${baseUrl}/api/bills`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': String(user1.user.id),
      },
      body: JSON.stringify({
        invoiceNumber: 'INV-100',
        customerName: 'Alpha Client',
        date: '2026-09-27',
        amount: 150.5,
        status: 'Pending',
        notes: 'test bill',
      }),
    })

    assert.equal(billCreate1.status, 201)

    const billsUser1 = await fetch(`${baseUrl}/api/bills`, {
      headers: { 'x-user-id': String(user1.user.id) },
    }).then((r) => r.json())

    const billsUser2 = await fetch(`${baseUrl}/api/bills`, {
      headers: { 'x-user-id': String(user2.user.id) },
    }).then((r) => r.json())

    assert.equal(billsUser1.length, 1)
    assert.equal(billsUser2.length, 0)
  } finally {
    server.close()
  }
})
