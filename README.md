# Stock Snapshot MCP

A minimal MCP server that provides **real-time stock price snapshots** for LLMs.

This server is designed for:
- AI agents
- LLM-powered research tools
- Automated market data retrieval

No analysis, no prediction — **just clean, structured stock price data**.

---

## Available Tool

### get_stock_snapshot

Get the latest price snapshot for a stock symbol.

**Arguments**
- `symbol` (string)  
  Stock symbol (e.g. `AAPL.US`, `7203.T`)

**Response (JSON)**
```json
{
  "symbol": "AAPL.US",
  "price": 123.45,
  "currency": "USD",
  "change": -0.67,
  "changePercent": -0.54,
  "asOf": "2026-01-02T05:30:00Z"
}
```

---
# Usage Policy
## Free Plan
- Up to 5 requests per day
- Intended for testing and personal use

## Pro Plan (500 JPY / month)

- Higher daily rate limit (200 requests/day)
- Commercial use allowed

Subscribe via Stripe:
https://buy.stripe.com/test_4gMbJ1ddydoa9vE4jd2VG00

After payment, you will receive a Pro API key.

### How to use Pro API key

```
MCP_API_KEY=your_pro_key npm start
```

#### Windows (PowerShell)
$env:MCP_API_KEY="your_pro_key"

#### macOS / Linux
MCP_API_KEY=your_pro_key


---

# Notes

- This server provides price snapshots only
- No financial advice or predictions are included
- Data accuracy is not guaranteed

# License
MIT
