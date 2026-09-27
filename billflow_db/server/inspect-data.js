const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:addy_0240@localhost:5433/billflow_db' });
(async () => {
  await client.connect();
  const bills = await client.query("SELECT id, user_id, invoice_number, customer_name, amount FROM bills ORDER BY created_at DESC LIMIT 20");
  const customers = await client.query("SELECT id, user_id, name, email FROM customers ORDER BY created_at DESC LIMIT 20");
  console.log('BILLS');
  console.log(JSON.stringify(bills.rows, null, 2));
  console.log('CUSTOMERS');
  console.log(JSON.stringify(customers.rows, null, 2));
  await client.end();
})().catch((err) => { console.error(err); process.exit(1); });
