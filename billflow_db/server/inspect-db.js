const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:addy_0240@localhost:5433/billflow_db' });
(async () => {
  await client.connect();
  const tables = ['users','bills','customers'];
  for (const table of tables) {
    const result = await client.query(
      "SELECT column_name, data_type, udt_name, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
      [table]
    );
    console.log('\nTABLE ' + table);
    console.log(JSON.stringify(result.rows, null, 2));
  }
  const users = await client.query('SELECT id, email, name, password_hash, role FROM users ORDER BY id');
  console.log('\nUSERS');
  console.log(JSON.stringify(users.rows, null, 2));
  await client.end();
})();
