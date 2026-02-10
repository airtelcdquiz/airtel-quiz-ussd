const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

pool.on("connect", () => console.log("✅ Postgres connected"));
pool.on("error", (err) => console.error("Postgres error:", err));

module.exports = pool;
