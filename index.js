import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import Database from "better-sqlite3";

const db = new Database("usage.db");

// テーブル作成（初回のみ）
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS usage (
    key TEXT,
    date TEXT,
    count INTEGER,
    PRIMARY KEY (key, date)
  )
`
).run();

function getApiKey() {
  return process.env.MCP_API_KEY || "FREE";
}

function checkUsageLimit(apiKey) {
  const today = new Date().toISOString().slice(0, 10);

  const limit = apiKey === "FREE" ? 5 : 200;

  const row = db
    .prepare("SELECT count FROM usage WHERE key = ? AND date = ?")
    .get(apiKey, today);

  const count = row ? row.count : 0;

  if (count >= limit) {
    throw new Error(
      `Usage limit exceeded (${limit}/day). Please upgrade to Pro plan.`
    );
  }

  if (row) {
    db.prepare(
      "UPDATE usage SET count = count + 1 WHERE key = ? AND date = ?"
    ).run(apiKey, today);
  } else {
    db.prepare("INSERT INTO usage (key, date, count) VALUES (?, ?, 1)").run(
      apiKey,
      today
    );
  }
}

async function fetchStockFromStooq(symbol) {
  // Stooqは小文字・市場サフィックスが必要
  const stooqSymbol = symbol.toLowerCase();

  const url = `https://stooq.com/q/l/?s=${stooqSymbol}&f=sd2t2ohlcv&h&e=csv`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch stock data");
  }

  const text = await res.text();
  const lines = text.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("Invalid CSV response");
  }

  const [_symbol, date, time, open, high, low, close, volume] =
    lines[1].split(",");

  if (close === "N/A") {
    throw new Error("Stock symbol not found");
  }

  return {
    symbol: symbol.toUpperCase(),
    price: Number(close),
    currency: stooqSymbol.endsWith(".jp") ? "JPY" : "USD",
    change: null,
    changePercent: null,
    asOf: `${date}T${time}Z`,
  };
}

/**
 * MCPサーバ定義
 */
const server = new McpServer({
  name: "stock-snapshot-mcp",
  version: "0.1.0",
});

/**
 * 株価スナップショット取得（ダミー）
 */
server.tool(
  "get_stock_snapshot",
  {
    symbol: z
      .string()
      .describe(
        "Stock symbol for price lookup. Required. Example: aapl.us, 7203.jp"
      ),
  },
  async ({ symbol }) => {
    try {
      const apiKey = getApiKey();

      // 利用制限チェック
      checkUsageLimit(apiKey);

      // 株価取得
      const data = await fetchStockFromStooq(symbol);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: err.message,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  }
);

/**
 * 起動
 */
const transport = new StdioServerTransport();
await server.connect(transport);
