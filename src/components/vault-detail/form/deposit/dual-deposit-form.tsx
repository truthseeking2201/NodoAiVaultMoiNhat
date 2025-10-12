import { DynamicFontText } from "@/components/ui/dynamic-font-text";
import { IconErrorToast } from "@/components/ui/icon-error-toast";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import Web3Button from "@/components/ui/web3-button";
import SuccessfulToast from "./successful-toast";
import { isMockMode } from "@/config/mock";
import {
  useGetLpToken,
  useGetVaultConfig,
  useRefreshAssetsBalance,
  useUserAssetsStore,
  useVaultBasicDetails,
  useWallet,
} from "@/hooks";
import useBreakpoint from "@/hooks/use-breakpoint";
import {
  useDepositDualVault,
  useEstimateDualDeposit,
} from "@/hooks/use-deposit-vault";
import { useToast } from "@/hooks/use-toast";
import { useTokenPrices } from "@/hooks/use-token-price";
import { getBalanceAmountForInput } from "@/lib/number";
import { cn, formatAmount } from "@/lib/utils";
import BigNumber from "bignumber.js";
import debounce from "lodash-es/debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DepositDualInput from "./deposit-dual-input";
import DepositDualModal from "./deposit-dual-modal";
import ConditionRenderer from "@/components/shared/condition-renderer";
import DualDepositSkeleton from "./dual-deposit-skeleton";
import RiskDisclosuresPopup from "./risk-disclosure-popup";
import { useRiskDisclosure } from "@/hooks/use-risk-disclosure";
import { useUsdDepositController } from "./hooks/use-usd-deposit-controller";

export type DualDepositSuccessData = {
  digest: string;
  ndlpReceived: number;
  actualInputAmountTokenA: number;
  actualInputAmountTokenB: number;
};

export type DualDepositForm = {
  token_a: {
    amount: string;
    address: string;
  };
  token_b: {
    amount: string;
    address: string;
  };
};

const QUICK_USD_VALUES = [5, 20, 50, 200];

const DepositForm = ({ vault_id }: { vault_id: string }) => {
  const { openConnectWalletDialog, isConnected } = useWallet();
  const { refreshAllBalance } = useRefreshAssetsBalance();
  const { assets } = useUserAssetsStore();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [depositSuccessData, setDepositSuccessData] =
    useState<DualDepositSuccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: vault, refetch: refetchVaultBasicDetails } =
    useVaultBasicDetails(vault_id);

  const pool = vault?.pool;
  const inputtingToken = useRef<string>("");

  const { refetch: refetchVaultConfig } = useGetVaultConfig(vault_id);
  const [debounceAmountTokenA, setDebounceAmountTokenA] = useState<string>("0");
  const [debounceAmountTokenB, setDebounceAmountTokenB] = useState<string>("0");

  const { isMd } = useBreakpoint();
  const { toast, dismiss } = useToast();

  const { deposit } = useDepositDualVault(vault_id);
  const { isAuthenticated } = useWallet();

  const { visibleDisclaimer, setVisibleDisclaimer } = useRiskDisclosure();
  const [isOpenRiskDisclosure, setIsOpenRiskDisclosure] = useState(false);

  const paymentTokens = useMemo(() => {
    return [pool?.token_a, pool?.token_b]?.filter(Boolean)?.map((token) => {
      const asset = assets.find(
        (asset) => asset.coin_type === token?.token_address
      );

      return {
        token_id: token?.token_id,
        symbol: token?.token_symbol,
        decimals: token.decimal,
        balance: isAuthenticated
          ? isMockMode
            ? "1000000"
            : asset?.balance || "0"
          : "0",
        token_address: token?.token_address,
        price_feed_id: token?.price_feed_id,
      };
    });
  }, [pool, assets, isAuthenticated]);

  const tokenIds = useMemo(() => {
    return paymentTokens?.map((token) => token?.token_id) || [];
  }, [paymentTokens]);

  const { data: tokenPrices } = useTokenPrices(tokenIds);

  const tokenA = useMemo(() => {
    const token = paymentTokens.find(
      (token) => token.token_address === pool?.token_a_address
    );
    return {
      ...token,
      usd_price: tokenPrices?.[token?.token_id] || 0,
    };
  }, [paymentTokens, pool, tokenPrices]);

  const tokenB = useMemo(() => {
    const token = paymentTokens.find(
      (token) => token.token_address === pool?.token_b_address
    );
    return {
      ...token,
      usd_price: tokenPrices?.[token?.token_id] || 0,
    };
  }, [paymentTokens, pool, tokenPrices]);

  const { data: estimateDualDeposit, isLoading: isEstimateDualDepositLoading } =
    useEstimateDualDeposit(vault_id);

  const lpToken = useGetLpToken(vault.vault_lp_token, vault_id);

  const splitWeights = useMemo(() => {
    const amountA = Number(estimateDualDeposit?.amount_a || 0);
    const amountB = Number(estimateDualDeposit?.amount_b || 0);
    const priceA = Number(tokenA?.usd_price || 0);
    const priceB = Number(tokenB?.usd_price || 0);
    const valueA = amountA * priceA;
    const valueB = amountB * priceB;
    const totalValue = valueA + valueB;
    if (totalValue > 0) {
      return {
        tokenA: valueA / totalValue,
        tokenB: valueB / totalValue,
      };
    }
    return {
      tokenA: 0.5,
      tokenB: 0.5,
    };
  }, [estimateDualDeposit, tokenA?.usd_price, tokenB?.usd_price]);

  const controllerTokens = useMemo(() => {
    if (!tokenA?.token_address || !tokenB?.token_address) {
      return [];
    }
    return [
      {
        address: tokenA.token_address,
        symbol: tokenA.symbol,
        decimals: tokenA.decimals,
        balance: Number(tokenA.balance || 0),
        price: Number(tokenA.usd_price || 0),
        weight: splitWeights.tokenA,
      },
      {
        address: tokenB.token_address,
        symbol: tokenB.symbol,
        decimals: tokenB.decimals,
        balance: Number(tokenB.balance || 0),
        price: Number(tokenB.usd_price || 0),
        weight: splitWeights.tokenB,
      },
    ];
  }, [splitWeights, tokenA, tokenB]);

  const {
    mode: depositMode,
    setMode: setDepositMode,
    targetUsd,
    setTargetUsd,
    autoBalance,
    setAutoBalance,
    computedTokens: controllerComputedTokens,
    tokenAmounts: controllerTokenAmounts,
    totalUsdTarget: controllerTotalUsdTarget,
    maxUsdFromBalances,
    hasEnoughOverall: hasEnoughUsdBalance,
    usdModeBlocked,
    usdShortfall,
    handleManualAmountChange,
    syncManualFromComputed,
    syncTargetFromManual,
  } = useUsdDepositController({
    tokens: controllerTokens,
    initialMode: "USD",
  });

  const handleDepositModeChange = (nextMode: "USD" | "Token") => {
    if (nextMode === depositMode) {
      return;
    }
    if (nextMode === "USD") {
      syncTargetFromManual();
    } else {
      syncManualFromComputed();
    }
    setDepositMode(nextMode);
  };

  const handleTargetUsdInput = (value: string) => {
    if (value === "") {
      setTargetUsd(0);
      return;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    setTargetUsd(Math.max(parsed, 0));
  };

  const handleManualAmountUpdate = (tokenAddress: string, amount: number) => {
    if (depositMode !== "Token") {
      return;
    }
    handleManualAmountChange(tokenAddress, amount);
  };

  const depositAmountUsd = useMemo(
    () => controllerTotalUsdTarget || 0,
    [controllerTotalUsdTarget]
  );

  const maxUsdLabel = useMemo(() => {
    return formatAmount({
      amount: maxUsdFromBalances || 0,
      precision: 2,
      stripZero: false,
      sign: "$",
    });
  }, [maxUsdFromBalances]);

  const shortfallLabel = useMemo(() => {
    if (usdShortfall <= 0) {
      return "";
    }
    return formatAmount({
      amount: usdShortfall,
      precision: 2,
      stripZero: false,
      sign: "$",
    });
  }, [usdShortfall]);

  const showUsdShortage =
    depositMode === "USD" &&
    controllerTotalUsdTarget > 0 &&
    !hasEnoughUsdBalance;

  const anyTokenDelta = useMemo(
    () => controllerComputedTokens.some((token) => token.delta > 0),
    [controllerComputedTokens]
  );

  const deltaSummary = useMemo(() => {
    return controllerComputedTokens
      .filter((token) => token.delta > 0)
      .map((token) =>
        `${formatAmount({
          amount: token.delta,
          precision: token.decimals,
          stripZero: true,
        })} ${token.symbol}`
      );
  }, [controllerComputedTokens]);

  const dualRequirementFooter = useMemo(() => {
    if (depositMode !== "USD" || !controllerComputedTokens.length) {
      return null;
    }
    return (
      <div className="space-y-2 text-xs text-white/60">
        {controllerComputedTokens.map((token) => {
          const requiredDisplay = formatAmount({
            amount: token.amount,
            precision: token.decimals,
            stripZero: true,
          });
          const balanceDisplay = formatAmount({
            amount: token.balance,
            precision: token.decimals,
            stripZero: true,
          });
          const deltaDisplay =
            token.delta > 0
              ? `+${formatAmount({
                  amount: token.delta,
                  precision: token.decimals,
                  stripZero: true,
                })}`
              : "0";
          const deltaClass =
            token.delta > 0 ? "text-red-400" : "text-emerald-300";

          return (
            <div
              key={token.address}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2"
            >
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wide text-white/40">
                  {token.symbol}
                </span>
                <span className="font-mono text-sm text-white">
                  {requiredDisplay} {token.symbol}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/50">You have</p>
                <p className="font-mono text-sm text-white">
                  {balanceDisplay} {token.symbol}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-white/50">Delta</p>
                <p className={cn("font-mono text-sm", deltaClass)}>
                  {deltaDisplay} {token.symbol}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [controllerComputedTokens, depositMode]);

  const depositCtaLabel = useMemo(() => {
    if (depositMode === "USD" && depositAmountUsd > 0) {
      return `Deposit ${formatAmount({
        amount: depositAmountUsd,
        precision: 2,
        stripZero: false,
        sign: "$",
      })}`;
    }
    return "Deposit";
  }, [depositAmountUsd, depositMode]);

  const defaultValues = useMemo(() => {
    return {
      token_a: {
        amount: "",
        address: pool?.token_a_address || "",
      },
      token_b: {
        amount: "",
        address: pool?.token_b_address || "",
      },
    };
  }, [pool]);

  const methods = useForm({
    defaultValues,
    mode: "onChange",
  });

  const { watch, formState, resetField, reset, setValue, getValues, clearErrors } =
    methods;

  const hasFormErrors = useMemo(() => {
    return Object.keys(formState.errors).length > 0;
  }, [formState.errors]);

  const isZeroDeposit = useMemo(() => {
    return (
      Number(debounceAmountTokenA) <= 0 && Number(debounceAmountTokenB) <= 0
    );
  }, [debounceAmountTokenA, debounceAmountTokenB]);

  const disableDepositButton = useMemo(() => {
    if (hasFormErrors) {
      return true;
    }
    if (usdModeBlocked) {
      return true;
    }
    if (isZeroDeposit) {
      return true;
    }
    if (depositMode === "USD" && controllerTotalUsdTarget <= 0) {
      return true;
    }
    return false;
  }, [
    controllerTotalUsdTarget,
    depositMode,
    hasFormErrors,
    isZeroDeposit,
    usdModeBlocked,
  ]);

  // Debounced effect for estimate deposit API call
  useEffect(() => {
    const debouncedCb = debounce((formValue) => {
      setDebounceAmountTokenA(formValue.token_a.amount || "0");
      setDebounceAmountTokenB(formValue.token_b.amount || "0");
    }, 500);
    const subscription = watch(debouncedCb);
    return () => subscription.unsubscribe();
  }, [watch, tokenA?.token_address, tokenB?.token_address]);

  useEffect(() => {
    if (depositMode !== "USD") {
      return;
    }
    if (!tokenA?.token_address || !tokenB?.token_address) {
      return;
    }
    const amountA =
      controllerTokenAmounts[tokenA.token_address] !== undefined
        ? controllerTokenAmounts[tokenA.token_address]
        : 0;
    const amountB =
      controllerTokenAmounts[tokenB.token_address] !== undefined
        ? controllerTokenAmounts[tokenB.token_address]
        : 0;
    const formattedA =
      amountA > 0
        ? new BigNumber(amountA)
            .decimalPlaces(tokenA.decimals, BigNumber.ROUND_DOWN)
            .toString()
        : "";
    const formattedB =
      amountB > 0
        ? new BigNumber(amountB)
            .decimalPlaces(tokenB.decimals, BigNumber.ROUND_DOWN)
            .toString()
        : "";

    const currentA = getValues("token_a.amount");
    if (currentA !== formattedA) {
      setValue("token_a.amount", formattedA, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: amountA > 0,
      });
      if (amountA <= 0) {
        clearErrors("token_a.amount");
      }
    }

    const currentB = getValues("token_b.amount");
    if (currentB !== formattedB) {
      setValue("token_b.amount", formattedB, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: amountB > 0,
      });
      if (amountB <= 0) {
        clearErrors("token_b.amount");
      }
    }
    inputtingToken.current = tokenA.token_address;
  }, [
    clearErrors,
    controllerTokenAmounts,
    depositMode,
    getValues,
    setValue,
    tokenA,
    tokenB,
  ]);

  useEffect(() => {
    if (isAuthenticated) {
      resetField("token_a.amount");
      resetField("token_b.amount");
      if (depositMode === "USD") {
        setTargetUsd(0);
        clearErrors(["token_a.amount", "token_b.amount"]);
      }
      if (tokenA?.token_address) {
        handleManualAmountChange(tokenA.token_address, 0);
      }
      if (tokenB?.token_address) {
        handleManualAmountChange(tokenB.token_address, 0);
      }
    }
  }, [
    clearErrors,
    depositMode,
    handleManualAmountChange,
    isAuthenticated,
    resetField,
    setTargetUsd,
    tokenA?.token_address,
    tokenB?.token_address,
  ]);

  const conversionRate = useMemo(() => {
    // todo: skip for now
    return 1;
  }, []);

  const ndlpAmount = useMemo(() => {
    const estimated_ndlp = estimateDualDeposit?.estimated_ndlp;
    const amount_a = Number(estimateDualDeposit?.amount_a || 0);
    const amount_b = Number(estimateDualDeposit?.amount_b || 0);
    if (!estimated_ndlp || (!amount_a && !amount_b)) {
      return 0;
    }
    const fromTokenA =
      amount_a > 0
        ? (Number(debounceAmountTokenA) * Number(estimated_ndlp)) /
          amount_a
        : 0;
    const fromTokenB =
      amount_b > 0
        ? (Number(debounceAmountTokenB) * Number(estimated_ndlp)) /
          amount_b
        : 0;

    if (depositMode === "USD") {
      return fromTokenA || fromTokenB || 0;
    }

    if (inputtingToken.current === tokenA.token_address) {
      return fromTokenA;
    }
    if (inputtingToken.current === tokenB.token_address) {
      return fromTokenB;
    }
    return fromTokenA || fromTokenB || 0;
  }, [
    depositMode,
    estimateDualDeposit,
    debounceAmountTokenA,
    debounceAmountTokenB,
    tokenA,
    tokenB,
  ]);

  const onSubmit = (data: DualDepositForm) => {
    if (visibleDisclaimer) {
      setIsOpenRiskDisclosure(true);
    } else {
      setIsDepositModalOpen(true);
    }
  };

  const handleReadDisclaimer = () => {
    setVisibleDisclaimer();
    setIsDepositModalOpen(true);
  };

  const handleCloseDepositModal = () => {
    if (depositStep === 2) {
      handleDone();
      return;
    }
    setIsDepositModalOpen(false);
    setLoading(false);
  };

  const handleDepositSuccessCallback = ({
    digest,
    ...rest
  }: DualDepositSuccessData) => {
    const timeoutId = setTimeout(async () => {
      setDepositSuccessData({
        digest,
        actualInputAmountTokenA: getBalanceAmountForInput(
          rest?.actualInputAmountTokenA,
          tokenA.decimals,
          tokenA.decimals
        ),
        actualInputAmountTokenB: getBalanceAmountForInput(
          rest?.actualInputAmountTokenB,
          tokenB.decimals,
          tokenB.decimals
        ),
        ndlpReceived: rest?.ndlpReceived
          ? getBalanceAmountForInput(
              rest.ndlpReceived,
              vault.vault_lp_token_decimals,
              vault.vault_lp_token_decimals
            )
          : +ndlpAmount,
      });
      setLoading(false);
      setDepositStep(2);
      refreshAllBalance();
      clearTimeout(timeoutId);
    }, 1000);
  };

  const handleSendRequestDeposit = async () => {
    try {
      setLoading(true);
      await deposit({
        coinA: {
          coin_type: tokenA.token_address,
          decimals: tokenA.decimals,
          amount: debounceAmountTokenA,
          price_feed_id: tokenA.price_feed_id,
        },
        coinB: {
          coin_type: tokenB.token_address,
          decimals: tokenB.decimals,
          amount: debounceAmountTokenB,
          price_feed_id: tokenB.price_feed_id,
        },
        exchange_id: vault?.exchange_id,
        tick_upper: estimateDualDeposit?.tick_upper,
        tick_lower: estimateDualDeposit?.tick_lower,
        onDepositSuccessCallback: handleDepositSuccessCallback,
        onDepositFailedCallback: (error) => {
          toast({
            title: "Deposit failed",
            description: error?.message || error,
            variant: "error",
            duration: 5000,
            icon: <IconErrorToast />,
          });
          setLoading(false);
        },
      });
    } catch (error) {
      toast({
        title: "Deposit failed",
        description: error?.message || error,
        variant: "error",
        duration: 5000,
        icon: <IconErrorToast />,
      });
      console.error(error);
      setLoading(false);
    }
  };

  const handleDone = () => {
    const message = `${formatAmount({
      amount: Number(depositSuccessData?.actualInputAmountTokenA),
      precision: tokenA?.decimals,
    })} ${tokenA?.symbol} and ${formatAmount({
      amount: Number(depositSuccessData?.actualInputAmountTokenB),
      precision: tokenB?.decimals,
    })} ${tokenB?.symbol} have been deposited to ${
      vault?.vault_name
    }. Check your wallet for Tx details`;

    reset(defaultValues);
    if (tokenA?.token_address) {
      handleManualAmountChange(tokenA.token_address, 0);
    }
    if (tokenB?.token_address) {
      handleManualAmountChange(tokenB.token_address, 0);
    }
    setIsDepositModalOpen(false);
    setDepositSuccessData(null);
    setDepositStep(1);
    setDebounceAmountTokenA("0");
    setDebounceAmountTokenB("0");
    if (depositMode === "USD") {
      setTargetUsd(0);
      clearErrors(["token_a.amount", "token_b.amount"]);
    }
    refetchVaultBasicDetails();
    refetchVaultConfig();
    toast({
      duration: 5000,
      description: (
        <SuccessfulToast
          title="Deposit successful!"
          content={message}
          closeToast={() => dismiss()}
        />
      ),
      variant: "success",
      hideClose: true,
    });
  };

  return (
    <FormProvider {...methods}>
      <ConditionRenderer
        when={!isEstimateDualDepositLoading}
        fallback={<DualDepositSkeleton />}
      >
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="mb-4 flex w-full items-center gap-2 rounded-full bg-white/10 p-1 text-xs md:text-sm">
            {(["USD", "Token"] as const).map((modeOption) => {
              const isActive = depositMode === modeOption;
              return (
                <button
                  key={modeOption}
                  type="button"
                  onClick={() => handleDepositModeChange(modeOption)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 font-medium transition-all",
                    isActive
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white"
                  )}
                >
                  {modeOption}
                </button>
              );
            })}
          </div>

          {depositMode === "USD" && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-white/60">
                  Target value (USD)
                </span>
                <span className="text-[11px] text-white/40">
                  Max available {maxUsdLabel}
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={
                    depositMode === "USD" && Number.isFinite(targetUsd)
                      ? targetUsd.toString()
                      : ""
                  }
                  onChange={(event) => handleTargetUsdInput(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 font-mono text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 md:text-lg"
                  placeholder="0.00"
                />
                <span className="text-xs text-white/60 md:w-auto md:text-sm">
                  We'll split into {tokenA?.symbol} / {tokenB?.symbol} for you.
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_USD_VALUES.map((value) => {
                  const isActive = Math.abs(targetUsd - value) < 0.001;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTargetUsd(value)}
                      className={cn(
                        "rounded-full border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide transition-all",
                        isActive
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/70 hover:bg-white/10"
                      )}
                    >
                      ${value}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setTargetUsd(maxUsdFromBalances)}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white transition-all hover:bg-white/10 disabled:opacity-30"
                  disabled={maxUsdFromBalances <= 0}
                >
                  Max
                </button>
              </div>
              <button
                type="button"
                onClick={() => setAutoBalance(!autoBalance)}
                className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70 transition-all hover:border-white/20"
              >
                <span className="font-medium">
                  Auto-balance small deltas (swap ≤0.5%)
                </span>
                <span
                  className={cn(
                    "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                    autoBalance ? "bg-emerald-400/70" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      autoBalance ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </span>
              </button>
              {autoBalance && anyTokenDelta && deltaSummary.length > 0 && (
                <p className="mt-2 text-xs text-emerald-300">
                  We'll rebalance {deltaSummary.join(" + ")} during deposit.
                </p>
              )}
              {!autoBalance && anyTokenDelta && deltaSummary.length > 0 && (
                <p className="mt-2 text-xs text-amber-200">
                  Add funds for {deltaSummary.join(", ")} or turn on auto-balance.
                </p>
              )}
            </div>
          )}

          {showUsdShortage && (
            <div className="mb-4 flex flex-col items-start justify-between gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-xs text-amber-200 md:flex-row md:items-center md:text-sm">
              <span>
                You're short by <span className="font-semibold">{shortfallLabel || "$0.00"}</span> — you can deposit up to <span className="font-semibold">{maxUsdLabel}</span> with current balances.
              </span>
              <button
                type="button"
                onClick={() => setTargetUsd(maxUsdFromBalances)}
                className="rounded-full border border-amber-400/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-100 transition-all hover:bg-amber-400/20"
              >
                Use {maxUsdLabel}
              </button>
            </div>
          )}

          <DepositDualInput
            tokenA={tokenA}
            tokenB={tokenB}
            estimateDualDeposit={estimateDualDeposit}
            readOnly={depositMode === "USD"}
            footer={dualRequirementFooter}
            onManualAmountChange={handleManualAmountUpdate}
            onTokenChange={(token) => {
              inputtingToken.current = token;
            }}
          />
          <div className="max-md:rounded-lg rounded-b-lg border border-white/0.20 p-4 mb-3 max-md:mt-3">
            <div className=" bg-black flex items-center justify-between pb-2">
              <LabelWithTooltip
                type="underline"
                label="Est. Receive"
                labelClassName="text-gray-200 text-base font-bold md:text-base text-sm"
                tooltipContent="Estimated amount based on current NDLP price. Final amount may vary slightly due to market conditions during processing."
              />
            </div>
            <div className="flex md:flex-row md:justify-between text-gray-200 font-bold font-mono items-center mb-2 md:mb-3 justify-end flex-row-reverse">
              <DynamicFontText
                maxWidth={300}
                breakpoints={[
                  { minLength: 0, fontSize: isMd ? "text-3xl" : "text-2xl" },
                  { minLength: 15, fontSize: isMd ? "text-2xl" : "text-xl" },
                  { minLength: 20, fontSize: isMd ? "text-xl" : "text-lg" },
                ]}
                defaultFontSize={isMd ? "text-2xl" : "text-xl"}
              >
                {ndlpAmount
                  ? ` ${formatAmount({
                      amount: ndlpAmount,
                      precision: vault.vault_lp_token_decimals,
                      stripZero: true,
                    })} `
                  : "--"}
              </DynamicFontText>
              <div
                className={
                  "flex items-center gap-2 font-bold text-sm md:text-lg"
                }
              >
                <img
                  src="/coins/ndlp.png"
                  alt="NDLP"
                  className="w-6 h-6 max-md:mr-2"
                />
                {isMd && lpToken?.display_name}
              </div>
            </div>
            <hr className="w-full border-t border-white/15" />
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex flex-col md:flex-row justify-start items-start md:items-center md:justify-between">
                <div
                  className={cn(
                    "font-sans text-sm text-white/80 md:text-sm max-md:mb-1.5 text-13px"
                  )}
                >
                  Network
                </div>
                <div className="text-sm font-mono text-white inline-flex items-center md:text-sm text-13px">
                  <img
                    src="/chains/sui.png"
                    alt="SUI"
                    className="w-6 h-6 mr-2"
                  />
                  SUI
                </div>
              </div>
            </div>
          </div>

          <Web3Button
            className="w-full rounded-lg py-3 font-semibold text-lg"
            type="button"
            disabled={
              disableDepositButton ||
              loading ||
              isEstimateDualDepositLoading
            }
            onClick={() => {
              if (!isConnected) {
                openConnectWalletDialog();
              } else {
                methods.handleSubmit(onSubmit)();
              }
            }}
          >
            {depositCtaLabel}
          </Web3Button>
          {usdModeBlocked && (
            <p className="mt-2 text-center text-xs text-amber-200">
              Turn on auto-balance or lower the USD target to match your wallet balances.
            </p>
          )}
        </form>
      </ConditionRenderer>

      <RiskDisclosuresPopup
        isOpen={isOpenRiskDisclosure}
        setIsOpen={setIsOpenRiskDisclosure}
        setVisibleDisclaimer={handleReadDisclaimer}
      />
      <DepositDualModal
        isOpen={isDepositModalOpen}
        depositStep={depositStep}
        onOpenChange={handleCloseDepositModal}
        onDeposit={handleSendRequestDeposit}
        onDone={handleDone}
        ndlpAmount={ndlpAmount}
        depositSuccessData={depositSuccessData}
        loading={loading}
        tokenA={{
          amount: debounceAmountTokenA,
          decimals: tokenA?.decimals || 6,
          symbol: tokenA?.symbol || "",
        }}
        tokenB={{
          amount: debounceAmountTokenB,
          decimals: tokenB?.decimals || 6,
          symbol: tokenB?.symbol || "",
        }}
        vault={vault}
      />
    </FormProvider>
  );
};

export default DepositForm;
