import knex from 'knex';

const globalForDb = globalThis as unknown as { __db?: ReturnType<typeof knex> };

const db = globalForDb.__db ?? (globalForDb.__db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
}));

export default db;
