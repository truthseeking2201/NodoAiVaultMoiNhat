# SOLUTION #4 - User Performance Comparison

## Scope (what ships)

**Goal:** let any user compare their performance (anonymously) to other vault users of the **same vault**, using **existing metrics** and formulas:

- Original/Total **Deposits (USD)**, **Withdrawals (USD)**, **Current Value (USD)**, **PnL (USD)**, **PnL (%)** (from the user tracking sheet & vault PnL system).
- Vault-level **24h Rolling APR**, **7-Day Avg APR**, and **APY** (only as context labels, using your current definitions and data sampling windows; not ranked per user).
- Optional vault context chips: **Utilization Rate**, **Fees/Rewards (24h)** (read-only, not ranked per user). (Utilization & fee/reward tracking are in the PRD vault metrics list.)

**Not in scope (Phase 1):** TWR, Sharpe, per-user time-in-range, or any metric not already defined/calculated in your stack. (These appear as strategy/testing KPIs, not user-facing stable metrics today.)

## UX (one tab inside Vault Detail -> "Your performance")

1. **Summary strip (left)**

   - **Your PnL USD / PnL %**
   - **Your original total deposit (USD)**, **current value (USD)**
   - Tiny caption: "PnL computed from deposits/withdrawals + current NDLP value" (derives from your tracking sheet and NDLP valuation logic).

2. **Distribution: PnL% histogram (right)**

   - 30 bins of **PnL %** across all users in the same vault; a vertical "You" marker + percentile chip.

3. **Anonymous leaderboard (table)**

   - Columns: **Alias**, **PnL %**, **PnL USD**, **Deposits (USD)**, **Withdrawals (USD)**, **Current Value (USD)**.
   - Your row is pinned and highlighted. Sorting defaults to **PnL %**.

4. **Context footer (read-only)**

   - **24h Rolling APR**, **7-Day APR**, **7-Day APY** (vault-level numbers, using the formulas already in PRD).

> **Why no TWR?** It is not defined/implemented in the current product data plane; your PRD defines APR/APY and the user/vault PnL fields we can trust today. We keep Phase-1 strictly to those.

## Data contracts & formulas (grounded in current PRD)

**User-level (from tracking sheet):**

- `total_deposits_usd`, `total_withdrawals_usd`, `current_value_usd`, `pnl_usd`, `pnl_pct`.

**Vault-level (context only):**

- **24h Rolling APR** = (fees+rewards last 24h valid snapshots) ÷ (avg TVL last 24h valid snapshots) × 365.
- **7-Day Avg APR** = average of 24h APRs over 7d.
- **24h Rolling APR** = (fees+rewards last 24h valid snapshots) ÷ (avg TVL last 24h valid snapshots) × 365.
- **7-Day Avg APR** = average of 24h APRs over 7d.
+ **7-Day APY** = \((1 + \frac{\text{7-Day APR}}{8760})^{8760} - 1\).

> Notes: APR/APY are **vault-level**; keep them as labels for context, not as per-user ranks. Your AI docs also warn about IL realization during rebalancing affecting APR - good to reflect in the methodology tooltip.

## Privacy & fairness

- **Alias per vault (stable & anonymous):** `alias = "0x" + first4(HMAC_SHA256(vaultId:wallet, PEPPER)) + "..." + last4(...)` (server-side secret pepper).
- **k-anonymity guard:** hide distribution/leaderboard if < 10 users in the vault; show "Not enough peers yet."
- **No wallet addresses, no exact timestamps in public tables.**

(Privacy is an implementation detail; it doesn't introduce new metrics.)

## API (minimal, only existing metrics)

All endpoints are **per vault** and return only fields your PRD already tracks.

1. **GET** `/api/v1/vaults/{vaultId}/perf/summary?wallet=…`

   Returns:

   ```json
   {
     "your": {
       "pnlUsd": 412.5,
       "pnlPct": 0.0825,
       "depositsUsd": 5000
     },
     "context": {
       "utilization": 0.67,
       "feesRewards24hUsd": 15892
     },
     "peer": {
       "percentilePnLPct": 0.66
     }
   }
   ```

   (All fields originate from the existing vault user PnL dataset. `percentilePnLPct` is the fraction of peers whose PnL % is less than or equal to the requesting wallet.)

2. **GET** `/api/v1/vaults/{vaultId}/perf/distribution?metric=pnlPct`

   Returns histogram bins and your marker:

   ```json
   {
     "bins": [
       { "x0": -0.20, "x1": -0.18, "count": 2 }
       // …
     ],
     "your": { "value": 0.0825 }
   }
   ```

3. **GET** `/api/v1/vaults/{vaultId}/perf/peers?sort=pnlPct&limit=20&offset=0`

   Returns anonymized rows using **only**: rank, alias, depositsUsd, pnlPct, pnlUsd.

   ```json
   {
     "total": 386,
     "rows": [
       {
         "rank": 1,
         "alias": "0x4a91...d3fe",
         "depositsUsd": 20000,
         "pnlPct": 0.41,
         "pnlUsd": 8221
       },
       {
         "rank": 2,
         "alias": "0xf27c...1ba0",
         "depositsUsd": 14500,
         "pnlPct": 0.35,
         "pnlUsd": 5102
       }
     ],
     "you": {
       "rank": 12,
       "alias": "0x2ac1...7d95",
       "depositsUsd": 5000,
       "pnlPct": 0.0825,
       "pnlUsd": 412
     }
   }
   ```

## Backend implementation notes

- **Sources of truth**
  - User PnL fields come from the **Vault User Tracking** system (sheet/DB) that already tracks per-user deposits, withdrawals, and current value for each vault.
  - Vault utilization and 24h fees/rewards pulled from the existing vault metrics endpoint.
- **PnL %** = `pnlUsd / max(total_deposits_usd, ε)` (no new math).

## UI details (polish)

- **Peer table:** titled "Peer Comparison (Anonymous)", paginated (20 rows per page), columns `# | Alias | Deposits (USD) | PnL % | PnL (USD)`, highlight your row.
- **Histogram:** 30 bins, "You" reference line; bin tooltips show range & count.
- **Accessibility:** ≥4.5:1 contrast; all numerics show units (%, USD).
- **Empty states:** explain why (e.g., "Not enough peers yet" / "No PnL yet").
- **Summary card:** surface PnL USD (large), PnL %, total deposits, utilization chip, 24h fees/rewards chip, and "You’re ahead of N% of peers" copy.

## Mock data (dev fixtures)

```json
{
  "summary": {
    "your": {
      "pnlUsd": 412.5,
      "pnlPct": 0.0825,
      "depositsUsd": 5000
    },
    "context": {
      "utilization": 0.67,
      "feesRewards24hUsd": 15892
    },
    "peer": {
      "percentilePnLPct": 0.66
    }
  },
  "distribution": {
    "bins": [
      { "x0": -0.20, "x1": -0.18, "count": 2 },
      { "x0": -0.18, "x1": -0.16, "count": 3 }
      // … 30 bins total
    ],
    "your": { "value": 0.0825 }
  },
  "peers": {
    "total": 386,
    "rows": [
      {
        "rank": 1,
        "alias": "0x4a91...d3fe",
        "depositsUsd": 20000,
        "pnlPct": 0.41,
        "pnlUsd": 8221
      },
      {
        "rank": 2,
        "alias": "0xf27c...1ba0",
        "depositsUsd": 14500,
        "pnlPct": 0.35,
        "pnlUsd": 5102
      }
    ],
    "you": {
      "rank": 12,
      "alias": "0x2ac1...7d95",
      "depositsUsd": 5000,
      "pnlPct": 0.0825,
      "pnlUsd": 412
    }
  }
}
```

## QA / guardrails (must pass)

- **Metric integrity:** every surfaced field must exist in the current user/vault data model (deposits, withdrawals, current value, PnL, PnL%).
- **APR/APY correctness:** only show vault-level APR/7d APY computed by the formulas already documented.
- **Privacy:** no raw addresses; aliases are stable per vault; do not render tables if **cohort < 10**.
- **Copy:** percentile copy reads "You’re ahead of N% of peers" and reflects the PnL% percentile returned by the API.

## Phase 2 (optional later - do not ship now)

- If you later add **time-in-range** and deeper IL series to per-user analytics, you can introduce more KPIs. For now, keep them **vault-level only**, as defined in AI KPIs.
