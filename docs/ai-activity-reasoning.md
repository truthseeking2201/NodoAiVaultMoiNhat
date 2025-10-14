# Vault Activities – AI Reasoning Notes

## Payload extension

Each activity row may now include a `reasoning` block when clients pass `include_reasoning=true` to the activities endpoint:

```ts
// /api/v1/vaults/:vaultId/activities?limit=5&offset=0&include_reasoning=true
{
  id: string;
  ts: string;
  type: 'OPEN' | 'HOLD' | 'ADD' | 'CLOSE_REOPEN' | 'COMPOUND' | 'WITHDRAW' | 'PAUSE' | ...;
  // existing fields
  reasoning?: {
    what: string;
    why: string;
    next: string;
    proof?: {
      tx?: string;
      label?: string;
    };
  };
}
```

Server logic keeps technical audit metadata private (under `_tech`) while surfacing only the human-friendly copy.

## Copy helper

`src/server/ai/copy.ts` exports `toPlainCopy`, which translates internal AI-agent state into the user-facing copy (“what / why / next”). The helper encodes the rules we follow today:

- **OPEN** — start small (~10%) when price sits inside the comfort window.
- **HOLD** — hold steady while the window is healthy and earnings continue.
- **ADD** — deploy idle cash into the steadiest, best-paying spot.
- **CLOSE_REOPEN** — close if the price stays outside the band (~120 min) and restart closer to the new price.
- **COMPOUND** — compound only when benefit clearly beats cost (>~20%).
- **WITHDRAW** — fill withdrawals from weaker spots first.
- **PAUSE** — safety sentinel triggered; resume once volatility calms down.

The copy helper can be reused by future views (e.g. a dedicated “AI decisions” drawer) without redefining rules.

## Front-end behaviour

- Default rows stay compact. Users tap/click “See why” to expand the inline reasoning block.
- Copy stays short (≤2 sentences per field) and avoids jargon or acronyms.
- Transaction links remain available via the “View transaction” action when the reasoning includes a `proof.tx` hash.
- Rows with no reasoning still render, but the expand control is hidden.

If the server omits reasoning (by default, or when `include_reasoning=false`), the UI gracefully hides the expander.
