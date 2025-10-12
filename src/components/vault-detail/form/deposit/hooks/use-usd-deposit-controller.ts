import { useCallback, useEffect, useMemo, useState } from "react";
import BigNumber from "bignumber.js";

type DepositMode = "USD" | "Token";

export type UsdControllerToken = {
  address: string;
  symbol: string;
  decimals: number;
  balance: number;
  price: number;
  weight?: number;
};

export type UsdControllerComputedToken = UsdControllerToken & {
  normalizedWeight: number;
  amount: number;
  usdValue: number;
  delta: number;
  hasEnoughBalance: boolean;
};

type UseUsdDepositControllerParams = {
  tokens: UsdControllerToken[];
  initialMode?: DepositMode;
  initialTargetUsd?: number;
  autoBalanceDefault?: boolean;
};

const DELTA_EPSILON = 1e-6;

export const useUsdDepositController = ({
  tokens,
  initialMode = "USD",
  initialTargetUsd = 0,
  autoBalanceDefault = true,
}: UseUsdDepositControllerParams) => {
  const sanitizedTokens = useMemo(() => {
    return tokens.map((token) => ({
      ...token,
      balance: Number(token.balance) || 0,
      price: Number(token.price) || 0,
      weight:
        typeof token.weight === "number" && !Number.isNaN(token.weight)
          ? token.weight
          : undefined,
    }));
  }, [tokens]);

  const [mode, setMode] = useState<DepositMode>(initialMode);
  const [targetUsd, setTargetUsd] = useState<number>(initialTargetUsd);
  const [autoBalance, setAutoBalance] = useState<boolean>(autoBalanceDefault);
  const [manualAmounts, setManualAmounts] = useState<Record<string, number>>(
    () =>
      sanitizedTokens.reduce<Record<string, number>>((acc, token) => {
        acc[token.address] = 0;
        return acc;
      }, {})
  );

  useEffect(() => {
    setManualAmounts((prev) =>
      sanitizedTokens.reduce<Record<string, number>>((acc, token) => {
        acc[token.address] =
          prev[token.address] !== undefined ? prev[token.address] : 0;
        return acc;
      }, {})
    );
  }, [sanitizedTokens]);

  const totalWeight = useMemo(() => {
    const supplied = sanitizedTokens.reduce((acc, token) => {
      if (typeof token.weight === "number") {
        return acc + token.weight;
      }
      return acc;
    }, 0);
    if (supplied > 0) {
      return supplied;
    }
    return sanitizedTokens.length || 1;
  }, [sanitizedTokens]);

  const manualUsdTotal = useMemo(() => {
    return sanitizedTokens.reduce((acc, token) => {
      const amount = manualAmounts[token.address] || 0;
      return acc + amount * token.price;
    }, 0);
  }, [sanitizedTokens, manualAmounts]);

  useEffect(() => {
    if (mode === "Token") {
      if (Math.abs(manualUsdTotal - targetUsd) > DELTA_EPSILON) {
        setTargetUsd(manualUsdTotal);
      }
    }
  }, [manualUsdTotal, mode, targetUsd]);

  const computedTokens: UsdControllerComputedToken[] = useMemo(() => {
    if (!sanitizedTokens.length) {
      return [];
    }
    return sanitizedTokens.map((token) => {
      const normalizedWeight =
        totalWeight > 0
          ? (token.weight ?? 1) / totalWeight
          : 1 / sanitizedTokens.length;
      const price = token.price || 0;

      const amount =
        mode === "USD"
          ? price > 0
            ? new BigNumber(targetUsd || 0)
                .multipliedBy(normalizedWeight)
                .dividedBy(price)
                .toNumber()
            : 0
          : manualAmounts[token.address] || 0;

      const usdValue = new BigNumber(amount).multipliedBy(price).toNumber();
      const delta = Math.max(0, amount - token.balance);

      return {
        ...token,
        normalizedWeight,
        amount,
        usdValue,
        delta,
        hasEnoughBalance: delta <= DELTA_EPSILON,
      };
    });
  }, [
    sanitizedTokens,
    manualAmounts,
    mode,
    targetUsd,
    totalWeight,
  ]);

  const tokenAmounts = useMemo(() => {
    return computedTokens.reduce<Record<string, number>>((acc, token) => {
      acc[token.address] = token.amount;
      return acc;
    }, {});
  }, [computedTokens]);

  const totalUsdTarget = useMemo(() => {
    if (mode === "USD") {
      return targetUsd;
    }
    return computedTokens.reduce((acc, token) => acc + token.usdValue, 0);
  }, [computedTokens, mode, targetUsd]);

  const maxUsdFromBalances = useMemo(() => {
    return sanitizedTokens.reduce((acc, token) => {
      return acc + token.balance * token.price;
    }, 0);
  }, [sanitizedTokens]);

  const hasEnoughOverall = useMemo(() => {
    if (!computedTokens.length) {
      return false;
    }
    return maxUsdFromBalances + DELTA_EPSILON >= totalUsdTarget;
  }, [computedTokens.length, maxUsdFromBalances, totalUsdTarget]);

  const usdShortfall = useMemo(() => {
    return Math.max(0, totalUsdTarget - maxUsdFromBalances);
  }, [maxUsdFromBalances, totalUsdTarget]);

  const usdModeBlocked = useMemo(() => {
    if (mode !== "USD") {
      return false;
    }
    if (autoBalance) {
      return false;
    }
    return computedTokens.some((token) => token.delta > DELTA_EPSILON);
  }, [autoBalance, computedTokens, mode]);

  const handleManualAmountChange = useCallback(
    (address: string, amount: number) => {
      setManualAmounts((prev) => {
        if (prev[address] === amount) {
          return prev;
        }
        return {
          ...prev,
          [address]: amount,
        };
      });
    },
    []
  );

  const syncManualFromComputed = useCallback(() => {
    setManualAmounts((prev) => {
      const next: Record<string, number> = { ...prev };
      computedTokens.forEach((token) => {
        next[token.address] = token.amount;
      });
      return next;
    });
  }, [computedTokens]);

  const syncTargetFromManual = useCallback(() => {
    setTargetUsd(manualUsdTotal);
  }, [manualUsdTotal]);

  return {
    mode,
    setMode,
    targetUsd,
    setTargetUsd,
    autoBalance,
    setAutoBalance,
    computedTokens,
    tokenAmounts,
    totalUsdTarget,
    maxUsdFromBalances,
    hasEnoughOverall,
    usdShortfall,
    usdModeBlocked,
    handleManualAmountChange,
    syncManualFromComputed,
    syncTargetFromManual,
  };
};

export type UseUsdDepositControllerReturn = ReturnType<
  typeof useUsdDepositController
>;
