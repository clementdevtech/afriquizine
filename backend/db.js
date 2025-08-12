require("dotenv").config();
const knex = require("knex");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not set in .env");
}

let databaseUrl = process.env.DATABASE_URL;

// Auto-encode password in DATABASE_URL if needed
try {
  const urlObj = new URL(databaseUrl);

  // Only encode if password exists and is not already encoded
  if (urlObj.password && decodeURIComponent(urlObj.password) === urlObj.password) {
    urlObj.password = encodeURIComponent(urlObj.password);
    databaseUrl = urlObj.toString();
    console.log("🔒 Password in DATABASE_URL has been safely URL-encoded.");
  }
} catch (err) {
  console.error("❌ Invalid DATABASE_URL format:", err.message);
  process.exit(1);
}



const db = knex({
  client: "pg",
  connection: {
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  },
});

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

module.exports = { db, pool };