type ReasoningInput = {
  type:
    | "OPEN"
    | "HOLD"
    | "ADD"
    | "CLOSE_REOPEN"
    | "COMPOUND"
    | "WITHDRAW"
    | "PAUSE";
  outOfWindowMinutes?: number;
  benefitPct?: number;
  startedSmall?: boolean;
  fastMove?: boolean;
  hasTx?: string;
};

type PlainCopy = {
  what: string;
  why: string;
  next: string;
  proof?: {
    tx?: string;
    label?: string;
  };
};

export function toPlainCopy(input: ReasoningInput): PlainCopy {
  switch (input.type) {
    case "OPEN":
      return {
        what: input.startedSmall
          ? "We started a small position."
          : "We opened a position.",
        why: "The market looked healthy and the fee outlook was good. Price sat near our chosen window, so we dipped a toe in.",
        next: "We’ll check again in about 10 minutes and add only if it keeps behaving.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    case "HOLD":
      return {
        what: "We kept the position as is.",
        why: "Price stayed inside our comfort window and it’s earning.",
        next: "We’ll move only if price drifts out or earnings slow down.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    case "ADD":
      return {
        what: "We put some idle money to work in the best-performing spot.",
        why: "That spot has been steady and paying; adding a bit more should help returns without extra risk.",
        next: "We’ll stop adding if the market turns shaky.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    case "CLOSE_REOPEN":
      return {
        what:
          "We closed the old position and will open a new one around today’s price.",
        why:
          input.outOfWindowMinutes && input.outOfWindowMinutes >= 120
            ? "Price sat outside our window for a good while and earnings no longer justified staying there."
            : "Earnings no longer justified the old spot.",
        next: "Short pause, then we’ll place a fresh window if things settle.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    case "COMPOUND":
      return {
        what: "We collected fees and put them back to work.",
        why:
          input.benefitPct && input.benefitPct >= 20
            ? "The extra earnings were clearly bigger than the costs of doing it."
            : "The extra earnings made sense to reinvest now.",
        next: "We’ll skip compounding when it wouldn’t meaningfully help.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    case "WITHDRAW":
      return {
        what: "We paid the withdrawal using our weaker spots first.",
        why: "That protects the strong earners and keeps the vault healthy.",
        next: "No follow-up needed unless a large request comes in.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    case "PAUSE":
      return {
        what: "We paused trading briefly.",
        why: input.fastMove
          ? "Price moved too fast all at once. A short pause avoids bad fills."
          : "We’re waiting for a calmer moment.",
        next: "We’ll resume once things calm down.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
    default:
      return {
        what: "We kept things steady.",
        why: "No changes were needed based on our checks.",
        next: "We’ll keep watching and adjust if the market shifts.",
        proof: input.hasTx ? { tx: input.hasTx } : undefined,
      };
  }
}
