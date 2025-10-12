export type SharePeriod = "7d" | "30d" | "all";

export type PnlCardPayload = {
  vaultId: string;
  vaultName: string;
  pnlPercent: number;
  pnlUsd: number;
  period: SharePeriod;
  walletMasked: string;
  sparkline: number[];
  hideAmounts?: boolean;
  timestampISO: string;
  accentColor?: string;
  vaultSymbols?: string[];
};

export type ShareToXRequest = {
  caption: string;
  payload: PnlCardPayload;
  imageDataUrl: string;
};
