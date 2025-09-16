import { formatNumber } from "@/lib/number";

export const formatCollateralUsdNumber = ({
  value_usd,
  value_collateral,
  isUsd,
  collateralDecimals = 4,
  fallback = "--",
}: {
  value_usd: number | string;
  value_collateral: number | string;
  isUsd: boolean;
  collateralDecimals?: number;
  fallback?: string;
}) => {
  if (isUsd) {
    if (!value_usd && typeof value_usd !== "number") return fallback;
    return formatNumber(value_usd, 0, 2);
  }
  if (!value_collateral && typeof value_collateral !== "number")
    return fallback;
  return formatNumber(value_collateral, 0, collateralDecimals);
};
