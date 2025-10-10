import { describe, it, expect } from "vitest";
import { derivePolicySummary } from "@/hooks/useSafetyInsights";
import {
  mockSafetyScore,
  mockVaultState,
  tierCopy,
} from "@/mocks/safety-score";

describe("derivePolicySummary", () => {
  it("returns positive tone for SAFE tier and mirrors tier copy", () => {
    const summary = derivePolicySummary(mockSafetyScore, mockVaultState);

    expect(summary.tier).toBe("SAFE");
    expect(summary.tone).toBe("positive");
    expect(summary.headline).toBe(tierCopy.SAFE.title);
    expect(summary.supportingCopy).toBe(tierCopy.SAFE.desc);
  });

  it("guards against zero TVL when computing large deposit thresholds", () => {
    const summary = derivePolicySummary(
      { ...mockSafetyScore, tier: "WAIT" },
      { ...mockVaultState, tvlUsd: 0 }
    );

    expect(summary.tone).toBe("warning");
    expect(summary.largeDepositThresholdUsd).toBe(0);
    expect(summary.largeDepositThresholdPct).toBe(
      mockVaultState.largeDepositThresholdPct
    );
  });
});
