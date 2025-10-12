import { truncateStringWithSeparator } from "@/utils/helpers";
import type { PnlCardPayload, SharePeriod } from "@/types/share";

const makeSparkline = (percent: number, points = 32): number[] => {
  const clamped = Number.isFinite(percent) ? percent : 0;
  const isPositive = clamped >= 0;
  const amplitude = Math.min(0.35, Math.abs(clamped) / 100);
  return Array.from({ length: points }, (_, index) => {
    const t = index / Math.max(1, points - 1);
    const ease = isPositive
      ? Math.pow(t, 1.4)
      : 1 - Math.pow(1 - t, 1.4);
    const wobble =
      Math.sin(index * 0.85) * 0.06 +
      Math.sin(index * 1.45 + 0.5) * 0.04;
    const direction = isPositive ? 0.45 : 0.55;
    const value = direction + ease * (isPositive ? amplitude : -amplitude) + wobble;
    return Math.min(0.95, Math.max(0.05, value));
  });
};

type BuildPnlSharePayloadArgs = {
  vaultId: string;
  vaultName: string;
  pnlPercent?: number | null;
  pnlUsd?: number | null;
  walletAddress?: string | null;
  period?: SharePeriod;
  sparkline?: number[];
  hideAmounts?: boolean;
  timestampISO?: string;
  vaultSymbols?: string[];
};

export const buildPnlSharePayload = ({
  vaultId,
  vaultName,
  pnlPercent = 0,
  pnlUsd = 0,
  walletAddress,
  period = "7d",
  sparkline,
  hideAmounts,
  timestampISO,
  vaultSymbols,
}: BuildPnlSharePayloadArgs): PnlCardPayload => {
  const masked =
    walletAddress && walletAddress.length
      ? truncateStringWithSeparator(walletAddress, 11, "…", 4)
      : "0x••••••••";

  const cardSparkline = sparkline && sparkline.length > 1
    ? sparkline
    : makeSparkline(pnlPercent ?? 0);

  return {
    vaultId,
    vaultName,
    pnlPercent: Number.isFinite(pnlPercent) ? pnlPercent ?? 0 : 0,
    pnlUsd: Number.isFinite(pnlUsd) ? pnlUsd ?? 0 : 0,
    period,
    walletMasked: masked,
    sparkline: cardSparkline,
    hideAmounts,
    timestampISO: timestampISO ?? new Date().toISOString(),
    vaultSymbols,
  };
};
