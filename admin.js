import Database from "better-sqlite3";

const db = new Database("usage.db");

function registerProKey(apiKey) {
  db.prepare(
    "INSERT INTO api_keys (key, plan, created_at) VALUES (?, 'pro', ?)"
  ).run(apiKey, new Date().toISOString());
}

// 手動登録
const apiKey = process.argv[2];
if (!apiKey) {
  console.error("Usage: node admin.js <api_key>");
  process.exit(1);
}

registerProKey(apiKey);
console.log("Pro API key registered:", apiKey);
