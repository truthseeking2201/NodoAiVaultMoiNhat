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
import { ChevronDown } from "lucide-react";
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
  const [showBreakdownDetails, setShowBreakdownDetails] = useState(false);

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

  const { computedTokens: controllerComputedTokens, handleManualAmountChange } =
    useUsdDepositController({
      tokens: controllerTokens,
      initialMode: "Token",
    });

  const handleManualAmountUpdate = (tokenAddress: string, amount: number) => {
    handleManualAmountChange(tokenAddress, amount);
  };

  const depositAmountUsd = useMemo(() => {
    return controllerComputedTokens.reduce(
      (acc, token) => acc + (token.usdValue || 0),
      0
    );
  }, [controllerComputedTokens]);

  const breakdownTokens = useMemo(() => {
    if (!controllerComputedTokens.length) {
      return [];
    }

    return controllerComputedTokens.map((token) => {
      const isStableCoin = token.symbol?.toUpperCase() === "USDC";
      const requiredDisplay = formatAmount({
        amount: token.amount,
        precision: token.decimals,
        stripZero: true,
      });
      const usdDisplay = formatAmount({
        amount: token.usdValue,
        precision: 2,
        stripZero: true,
        sign: "$",
      });
      const balanceDisplay = formatAmount({
        amount: token.balance,
        precision: token.decimals,
        stripZero: true,
      });
      const deltaDisplay =
        token.delta > 0
          ? formatAmount({
              amount: token.delta,
              precision: token.decimals,
              stripZero: true,
            })
          : "";
      const pillValue = isStableCoin
        ? usdDisplay
        : `${requiredDisplay} ${token.symbol}`;
      const pillDelta =
        token.delta > 0
          ? isStableCoin
            ? formatAmount({
                amount: token.delta,
                precision: 2,
                stripZero: true,
                sign: "$",
              })
            : `${formatAmount({
                amount: token.delta,
                precision: token.decimals,
                stripZero: true,
              })} ${token.symbol}`
          : "";
      const detailDeltaDisplay =
        token.delta > 0
          ? isStableCoin
            ? `+${formatAmount({
                amount: token.delta,
                precision: 2,
                stripZero: true,
                sign: "$",
              })}`
            : `+${formatAmount({
                amount: token.delta,
                precision: token.decimals,
                stripZero: true,
              })} ${token.symbol}`
          : "—";

      return {
        ...token,
        requiredDisplay,
        usdDisplay,
        balanceDisplay,
        deltaDisplay,
        hasShortfall: token.delta > 0,
        rawAmount: token.amount,
        pillValue,
        pillDelta,
        detailDeltaDisplay,
      };
    });
  }, [controllerComputedTokens]);

  const shouldShowBreakdown = useMemo(() => {
    return breakdownTokens.some(
      (token) => token.rawAmount > 0 || token.hasShortfall
    );
  }, [breakdownTokens]);

  const depositCtaLabel = useMemo(() => {
    if (depositAmountUsd > 0) {
      return `Deposit ${formatAmount({
        amount: depositAmountUsd,
        precision: 2,
        stripZero: false,
        sign: "$",
      })}`;
    }
    return "Deposit";
  }, [depositAmountUsd]);

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
    if (isZeroDeposit) {
      return true;
    }
    return false;
  }, [hasFormErrors, isZeroDeposit]);

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
    if (!shouldShowBreakdown) {
      setShowBreakdownDetails(false);
    }
  }, [shouldShowBreakdown]);

  useEffect(() => {
    if (isAuthenticated) {
      resetField("token_a.amount");
      resetField("token_b.amount");
      clearErrors(["token_a.amount", "token_b.amount"]);
      if (tokenA?.token_address) {
        handleManualAmountChange(tokenA.token_address, 0);
      }
      if (tokenB?.token_address) {
        handleManualAmountChange(tokenB.token_address, 0);
      }
    }
  }, [
    clearErrors,
    handleManualAmountChange,
    isAuthenticated,
    resetField,
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

    if (inputtingToken.current === tokenA.token_address) {
      return fromTokenA;
    }
    if (inputtingToken.current === tokenB.token_address) {
      return fromTokenB;
    }
    return fromTokenA || fromTokenB || 0;
  }, [
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
    clearErrors(["token_a.amount", "token_b.amount"]);
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
          {shouldShowBreakdown && (
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                <span className="uppercase tracking-wide text-white/40">
                  Needs:
                </span>
                {breakdownTokens.map((token) => (
                  <div
                    key={token.address}
                    className={cn(
                      "flex items-center gap-1 rounded-full border px-3 py-1 font-mono",
                      token.hasShortfall
                        ? "border-amber-300/40 bg-amber-400/10 text-amber-100"
                        : "border-white/15 bg-white/10 text-white"
                    )}
                  >
                    <span>{token.symbol}</span>
                    <span>{token.pillValue}</span>
                    {token.hasShortfall ? (
                      <span className="text-amber-200">
                        +{token.pillDelta}
                      </span>
                    ) : (
                      <span className="text-emerald-300">✓</span>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setShowBreakdownDetails((prev) => !prev)
                  }
                  className="ml-auto flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70 transition-colors hover:border-white/20 hover:text-white"
                >
                  Details
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      showBreakdownDetails ? "rotate-180" : "rotate-0"
                    )}
                  />
                </button>
              </div>
              {showBreakdownDetails && (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
                  <table className="w-full border-separate border-spacing-y-1">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wide text-white/40">
                        <th className="pb-1 text-left font-medium">Token</th>
                        <th className="pb-1 text-right font-medium">
                          Required
                        </th>
                        <th className="pb-1 text-right font-medium">
                          You have
                        </th>
                        <th className="pb-1 text-right font-medium">Delta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdownTokens.map((token) => (
                        <tr key={token.address}>
                          <td className="py-1 font-medium text-white">
                            {token.symbol}
                          </td>
                          <td className="py-1 text-right font-mono text-white">
                            {token.requiredDisplay} {token.symbol}
                          </td>
                          <td className="py-1 text-right font-mono text-white/70">
                            {token.balanceDisplay} {token.symbol}
                          </td>
                          <td
                            className={cn(
                              "py-1 text-right font-mono",
                              token.hasShortfall
                                ? "text-amber-200"
                                : "text-emerald-300"
                            )}
                          >
                            {token.hasShortfall
                              ? token.detailDeltaDisplay
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <DepositDualInput
            tokenA={tokenA}
            tokenB={tokenB}
            estimateDualDeposit={estimateDualDeposit}
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
