import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChevronDown from "@/assets/icons/chevron-down-gradient.svg?react";
import {
  useGetLpToken,
  useGetVaultConfig,
  useUserHolding,
  useVaultMetricUnitStore,
  useWallet,
} from "@/hooks";
import { formatNumber } from "@/lib/number";
import { BasicVaultDetailsType } from "@/types/vault-config.types";
import { ChevronRight, Info } from "lucide-react";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import useBreakpoint from "@/hooks/use-breakpoint";
import { calculateUserHoldings } from "@/utils/helpers";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import ConditionRenderer from "@/components/shared/condition-renderer";
import FormatUsdCollateralAmount from "./format-usd-collateral-amount";
import { formatCollateralUsdNumber } from "../helpers";
import { StreakTrackerCard } from "@/components/streak/StreakTrackerCard";
import { utcDayKey } from "@/features/streak-vault/logic";
import { useStreak } from "@/features/streak-vault/hooks/use-streak";
import type { StreakReward } from "@/features/streak-vault/types";
import { dispatchMissionDepositPrefill } from "@/lib/mission-events";

type YourHoldingProps = {
  isDetailLoading: boolean;
  vault_id: string;
  vault: BasicVaultDetailsType;
  activeTab: number;
};

const STREAK_REWARD_XP: Record<number, number> = {
  1: 100,
  3: 300,
  7: 1_000,
  14: 2_400,
  30: 6_000,
};

const getMsUntilNextUtcMidnight = () => {
  const now = new Date();
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  );
  return Math.max(0, next - now.getTime());
};

const toMilestones = (rewards: StreakReward[] | undefined) => {
  if (!rewards?.length) {
    return Object.entries(STREAK_REWARD_XP).map(([day, xp]) => ({
      days: Number(day),
      xp,
    }));
  }

  return rewards.map((reward) => ({
    days: reward.threshold,
    xp: STREAK_REWARD_XP[reward.threshold] ?? 0,
  }));
};

const COLORS = [
  "#52BDE1",
  "#CC98FF",
  "#52E1A5",
  "#FFEC98",
  "#5254E1",
  "#B94E50",
  "#FFFFFF",
  "#98C3FF",
];

const HoldingCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-[#2A2A2A] bg-white/10 md:p-4 py-2 px-3 w-full",
        className
      )}
    >
      {children}
    </div>
  );
};

const UnSignedHolding = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      <div>
        <div className="font-bold text-base">Ready to Grow Your Holdings?</div>
        <div className="text-sm text-white/60 mt-2">
          Feed the vault with your first deposit below and start collecting
          rewards
        </div>
      </div>
      <div className="md:mt-[-12px]">
        <img
          src="/banners/welcome-icon.png"
          alt="Welcome Icon"
          className="w-auto h-auto"
        />
      </div>
    </div>
  );
};

const YourHoldings = ({
  isDetailLoading,
  vault_id,
  vault,
  activeTab,
}: YourHoldingProps) => {
  const [expanded, setExpanded] = useState(false);
  const { isAuthenticated, address } = useWallet();
  const [userState, setUserState] = useState<
    "nonDeposit" | "pending" | "holding"
  >("nonDeposit");

  const { isMobile } = useBreakpoint();
  const { unit, isUsd } = useVaultMetricUnitStore(vault_id);

  const { vaultConfig } = useGetVaultConfig(vault_id);
  const lpToken = useGetLpToken(vault?.vault_lp_token, vault_id);

  const ndlp_balance = lpToken?.balance || "0";
  const hasNDLP = Number(ndlp_balance) > 0;
  const {
    record: streakRecord,
    events: streakEvents,
    rewards: streakRewards,
    ensureSnapshotForToday: ensureStreakSnapshot,
  } = useStreak(
    vault_id,
    isAuthenticated ? address : undefined
  );
  const streakMilestones = useMemo(
    () => toMilestones(streakRewards),
    [streakRewards]
  );
  const streakResetInMs = getMsUntilNextUtcMidnight();

  useEffect(() => {
    ensureStreakSnapshot(hasNDLP);
  }, [ensureStreakSnapshot, hasNDLP]);
  const { data, refetch } = useUserHolding(
    vault_id,
    ndlp_balance,
    isAuthenticated
  );

  useEffect(() => {
    if (activeTab === 1) {
      refetch();
    }
  }, [activeTab, refetch]);

  const user_total_liquidity = calculateUserHoldings(
    ndlp_balance,
    vault?.user_pending_withdraw_ndlp,
    vault?.vault_lp_token_decimals,
    isUsd ? data?.ndlp_price_usd : data?.ndlp_price
  );

  const userHoldingData = useMemo(() => {
    return {
      ...data,
      user_total_liquidity,
      user_total_deposit_usd: data?.user_total_deposit_usd || 0,
      user_ndlp_balance: lpToken?.balance || 0,
      user_vault_rewards:
        data?.user_vault_rewards || vault?.reward_tokens || [],
      user_vault_tokens: data?.user_vault_tokens || vault?.change_24h || [],
    };
  }, [data, vault, lpToken, user_total_liquidity]);

  const pieData = useMemo(() => {
    const totalAmountInUsd = userHoldingData?.user_vault_tokens?.reduce(
      (sum, item) =>
        "amount_in_usd" in item && typeof item.amount_in_usd === "number"
          ? sum + item.amount_in_usd
          : sum,
      0
    );

    return (
      userHoldingData?.user_vault_tokens
        ?.slice()
        .sort(
          (a, b) => Number(b.amount_in_usd ?? 0) - Number(a.amount_in_usd ?? 0)
        )
        .map((item) => {
          return {
            amount: item?.amount || 0,
            amount_in_usd: item?.amount_in_usd || 0,
            token_name: item?.token_name || "",
            name: item?.token_name,
            token_symbol: item?.token_symbol,
            value: Number(item?.amount_in_usd) / totalAmountInUsd,
          };
        }) || []
    );
  }, [userHoldingData]);

  const hasValue = useMemo(() => {
    return (
      userHoldingData?.user_vault_tokens?.reduce(
        (sum, item) =>
          "amount_in_usd" in item && typeof item.amount_in_usd === "number"
            ? sum + item.amount_in_usd
            : sum,
        0
      ) > 0
    );
  }, [userHoldingData?.user_vault_tokens]);

  useEffect(() => {
    if (isAuthenticated && userHoldingData) {
      if (user_total_liquidity > 0 && hasValue) {
        setUserState("holding");
      } else if (user_total_liquidity > 0 && !hasValue) {
        setUserState("pending");
      } else if (user_total_liquidity === 0) {
        setUserState("nonDeposit");
      }
    } else {
      setUserState("nonDeposit");
    }
  }, [isAuthenticated, userHoldingData, user_total_liquidity, hasValue]);

  useEffect(() => {
    setExpanded(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <DetailWrapper
      title={
        userState !== "nonDeposit" ? "Your Holdings" : "Welcome to NODO Vault!"
      }
      isLoading={isDetailLoading}
      loadingStyle="h-[68px] w-full"
      className={cn(!expanded && "!pb-0")}
    >
      <ConditionRenderer
        when={userState !== "nonDeposit"}
        fallback={<UnSignedHolding />}
      >
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <LabelWithTooltip
                hasIcon={false}
                label="Total Liquidity"
                tooltipContent={
                  <div className="text-white/80 text-xs font-sans">
                    Total User Liquidity Value at the current market price
                  </div>
                }
                labelClassName="text-white/60 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
              />
              <FormatUsdCollateralAmount
                className="md:text-xl text-base font-mono font-semibold text-white"
                collateralIcon={unit}
                text={formatCollateralUsdNumber({
                  value_usd: user_total_liquidity,
                  value_collateral: user_total_liquidity,
                  isUsd,
                  unit,
                })}
              />
            </div>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "md"}
              className="border border-[#505050] md:w-[140px] w-[110px] md:h-[44px] h-[32px] "
              onClick={() => setExpanded((v) => !v)}
            >
              <span
                className="md:text-base text-xs font-semibold"
                style={{
                  background:
                    "linear-gradient(90deg, #FFE8C9 0%, #F9F4E9 25%, #E3F6FF 60%, #C9D4FF 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {expanded ? "View Less" : "View More"}
                <ChevronDown
                  className={`inline-block w-4 h-4 ml-1
              transition-transform duration-200 transform
              ${expanded ? "rotate-180" : ""}
              `}
                />
              </span>
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              className="flex flex-col gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              key="box"
            >
              <HoldingCard>
                <LabelWithTooltip
                  hasIcon={false}
                  label="Estimated LP Breakdown (secure, updates in ~1h)"
                  tooltipContent={
                    <div className="text-white/80 text-xs font-sans">
                      Breakdown of underlying tokens based on the your ownership
                      share in the vault
                    </div>
                  }
                  labelClassName="text-white/60 md:text-sm text-[10px] mb-2 underline underline-offset-4 decoration-dotted decoration-gray-600"
                />
                <div className="flex md:gap-4 gap-1 items-center">
                  <div className="flex-1">
                    <div
                      className="mdmax-h-[150px] max-h-[100px] overflow-auto pr-2"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#555 transparent",
                        WebkitOverflowScrolling: "touch",
                      }}
                    >
                      {userState === "pending" && (
                        <div className="flex gap-2 flex-col">
                          {userHoldingData?.user_vault_tokens?.map(
                            (item, idx) => (
                              <div
                                key={`icon-${idx}`}
                                className="flex items-center gap-2"
                              >
                                <img
                                  src={`/coins/${item.token_symbol.toLowerCase()}.png`}
                                  className="w-[18px] h-[18px] inline-flex items-center"
                                />
                                <TooltipProvider delayDuration={0}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="bg-[#23272F] text-[#6AD6FF] px-2 py-1 rounded text-xs">
                                        Calculating
                                        <span className="animate-fade-in-out inline-block font-mono">
                                          .
                                        </span>
                                        <span className="animate-fade-in-out inline-block delay-100 font-mono">
                                          .
                                        </span>
                                        <span className="animate-fade-in-out inline-block delay-200 font-mono">
                                          .
                                        </span>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      align="center"
                                      className="bg-black/90 rounded-xl shadow-lg p-4 w-[350px] z-50 border border-[#23272F]"
                                    >
                                      <span className="text-white/80 text-xs">
                                        Your deposit has been received and is
                                        queued for the next{" "}
                                        <span className="font-bold">
                                          "Add liquidity"
                                        </span>{" "}
                                        cycle. Please wait for the next vault
                                        transaction
                                      </span>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {userState === "holding" && (
                        <div className="flex flex-col gap-2">
                          {pieData?.map((item, idx) => (
                            <div
                              key={item.token_name}
                              className="flex md:items-center gap-1  w-full items-between "
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <div
                                  className={`mr-1 rounded-full w-1 h-8`}
                                  style={{
                                    background: COLORS[idx],
                                  }}
                                />
                                <img
                                  src={`/coins/${item.token_symbol.toLowerCase()}.png`}
                                  className="w-[18px] h-[18px] inline-flex self-center"
                                />
                                <div className="flex flex-col items-end md:max-w-[110px] max-w-[100px] justify-end flex-1">
                                  <div className="font-mono text-white md:text-sm text-xs">
                                    {formatNumber(
                                      item.amount,
                                      0,
                                      Number(item.amount) < 1 ? 6 : 2
                                    )}
                                  </div>
                                  {Number(item.amount_in_usd) > 0 && (
                                    <div className="text-white/40 md:text-sm text-xs font-mono">
                                      ~$
                                      {formatNumber(
                                        Number(item.amount_in_usd),
                                        0,
                                        Number(item.amount_in_usd) < 1 ? 6 : 2
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-end md:text-sm text-xs md:max-w-[80px] w-[45px]">
                                {pieData.length > 0 &&
                                  `${formatNumber(
                                    pieData[idx].value * 100,
                                    0,
                                    2
                                  )}%`}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    {userState === "holding" && (
                      <PieChart
                        width={isMobile ? 86 : 120}
                        height={isMobile ? 86 : 120}
                        tabIndex={-1}
                        className="cursor-not-allowed pointer-events-none select-none"
                      >
                        <Pie
                          data={pieData}
                          cx={isMobile ? 40 : 58}
                          cy={isMobile ? 40 : 58}
                          innerRadius={isMobile ? 32 : 48}
                          outerRadius={isMobile ? 36 : 52}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={0}
                          endAngle={900}
                          paddingAngle={3}
                          cornerRadius={20}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell
                              key={`cell-${idx}`}
                              fill={COLORS[idx % COLORS.length]}
                              stroke="none"
                              pointerEvents="none"
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    )}
                  </div>
                </div>
              </HoldingCard>
              <HoldingCard>
                <StreakTrackerCard
                  current={streakRecord?.current ?? 0}
                  longest={streakRecord?.longest ?? 0}
                  todayDone={streakEvents.some(
                    (event) => event.dayKey === utcDayKey(Date.now())
                  )}
                  resetInMs={streakResetInMs}
                  milestones={streakMilestones}
                  onDeposit={() => dispatchMissionDepositPrefill(0)}
                />
              </HoldingCard>
              <div className="flex gap-4">
                <HoldingCard>
                  <LabelWithTooltip
                    hasIcon={false}
                    label="NDLP Balance"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Your current NDLP position in this vault (Unit USD)
                      </div>
                    }
                    labelClassName="text-white/60 md:text-xs text-[10px] mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <div className="font-mono text-white md:text-xl text-sm flex items-center gap-1">
                    <img src={`/coins/ndlp.png`} className="w-5 h-5" />
                    {userHoldingData?.user_ndlp_balance && isAuthenticated
                      ? formatNumber(
                          userHoldingData?.user_ndlp_balance,
                          0,
                          Number(userHoldingData?.user_ndlp_balance) < 1 ? 6 : 2
                        )
                      : "--"}
                  </div>
                </HoldingCard>
                <HoldingCard>
                  <div className="flex items-center justify-between">
                    <div className="text-white/60 md:text-xs text-[10px] mb-1 md:tracking-normal tracking-tight">
                      Total Rewards Earned
                    </div>
                    {hasValue && (
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="rounded-full md:w-6 md:h-6 w-4 h-4 flex items-center justify-center bg-black/40 border border-white/30">
                              <ChevronRight className="md:w-4 md:h-4 h:3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            align="center"
                            className="bg-black/90 rounded-xl shadow-lg p-4 min-w-[220px] z-50 border border-[#23272F]"
                          >
                            <div className="text-white/80 text-sm font-semibold mb-2">
                              Rewards Breakdown
                            </div>
                            <hr className="mx-[-16px] my-2" />
                            {userHoldingData?.user_vault_rewards?.map(
                              (reward, idx) => (
                                <div
                                  key={reward.token}
                                  className="flex items-center gap-2 mb-1"
                                >
                                  <img
                                    src={`/coins/${reward.token_symbol.toLowerCase()}.png`}
                                    className="w-5 h-5 inline-flex items-center"
                                  />
                                  <span className="font-mono text-white text-xs">
                                    {formatNumber(
                                      reward.amount,
                                      0,
                                      reward.amount < 1 ? 6 : 3
                                    )}{" "}
                                    {reward.token_symbol}
                                  </span>
                                  {reward.amount_in_usd > 0 && (
                                    <span className="text-white/40 text-xs">
                                      ~ $
                                      {formatNumber(
                                        reward.amount_in_usd,
                                        0,
                                        reward.amount_in_usd < 1 ? 6 : 2
                                      )}
                                    </span>
                                  )}
                                </div>
                              )
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <div
                    className="font-mono md:text-xl text-sm font-medium"
                    style={{
                      color:
                        userState === "holding" &&
                        userHoldingData?.user_total_rewards_usd
                          ? "#3FE6B0"
                          : "#fff",
                    }}
                  >
                    {userState === "holding" &&
                    userHoldingData?.user_total_rewards_usd ? (
                      <FormatUsdCollateralAmount
                        collateralIcon={unit}
                        text={formatCollateralUsdNumber({
                          value_usd: userHoldingData?.user_total_rewards_usd,
                          value_collateral:
                            userHoldingData?.user_total_rewards_collateral,
                          isUsd,
                          unit,
                        })}
                      />
                    ) : (
                      <span className="text-[#00FFB2]">
                        <span className="font-medium">Farming</span>
                        <span className="animate-fade-in-out inline-block">
                          .
                        </span>
                        <span className="animate-fade-in-out inline-block delay-100">
                          .
                        </span>
                        <span className="animate-fade-in-out inline-block delay-200">
                          .
                        </span>
                        <span className="animate-fade-in-out inline-block delay-300">
                          .
                        </span>
                      </span>
                    )}
                  </div>
                </HoldingCard>
              </div>
              <HoldingCard>
                <div className="text-white text-sm font-bold mb-1">
                  Cashflow
                </div>
                <div className="flex items-center text-xs">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Total Deposits"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Total amount you’ve deposited into this vault.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <FormatUsdCollateralAmount
                    collateralIcon={unit}
                    text={formatCollateralUsdNumber({
                      value_usd: userHoldingData?.user_total_deposit_usd,
                      value_collateral:
                        userHoldingData?.user_total_deposit_collateral,
                      isUsd,
                      unit,
                    })}
                    className="font-mono"
                    collateralClassName="w-4 h-4"
                  />
                </div>
                <div className="flex items-center text-xs my-1">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Total Withdrawals"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Total amount you’ve withdrawn from this vault.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2 "></span>
                  <FormatUsdCollateralAmount
                    collateralIcon={unit}
                    text={formatCollateralUsdNumber({
                      value_usd: userHoldingData?.user_total_withdraw_usd,
                      value_collateral:
                        userHoldingData?.user_total_withdraw_collateral,
                      isUsd,
                      unit,
                    })}
                    className="font-mono"
                    collateralClassName="w-4 h-4"
                  />
                </div>
                <div className="flex items-center text-xs">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="24h Rewards"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Rewards you earned in the last 24 hours. Calculated from
                        recent fee events and your share of the pool. Updates
                        every 1 hour.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    {isAuthenticated ? (
                      userHoldingData?.user_rewards_24h_usd > 0 ? (
                        <FormatUsdCollateralAmount
                          collateralIcon={unit}
                          text={formatCollateralUsdNumber({
                            value_usd: userHoldingData?.user_rewards_24h_usd,
                            value_collateral:
                              userHoldingData?.user_rewards_24h_collateral,
                            isUsd,
                            unit,
                          })}
                          className="font-mono"
                          collateralClassName="w-4 h-4"
                        />
                      ) : (
                        <span className="text-[#00FFB2]">
                          <span>Farming</span>
                          <span className="animate-fade-in-out inline-block delay-100">
                            .
                          </span>
                          <span className="animate-fade-in-out inline-block delay-200">
                            .
                          </span>
                          <span className="animate-fade-in-out inline-block delay-300">
                            .
                          </span>
                        </span>
                      )
                    ) : (
                      "0"
                    )}
                  </span>
                </div>
              </HoldingCard>
              <HoldingCard>
                <div className="text-white font-bold text-sm mb-1">
                  Position
                </div>
                <div className="flex items-center text-xs ">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Share in Vault"
                    tooltipContent={
                      <div className="text-white/80 text-xs font-sans">
                        Your ownership percentage of this vault. Updates with
                        NDLP balance changes.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs mb-1 underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <span className="font-mono">
                    {isAuthenticated
                      ? formatNumber(
                          userHoldingData?.user_shares_percent * 100,
                          0,
                          userHoldingData?.user_shares_percent * 100 < 1 ? 6 : 2
                        )
                      : "0"}
                    %
                  </span>
                </div>
                <div className="flex items-center text-xs mt-1">
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Break-Even Price"
                    tooltipContent={
                      <div className="text-white/80 text-xs max-w-[200px] font-sans">
                        NDLP price where you can withdraw your deposits without
                        profit or loss. Recalculated after each deposit or full
                        withdrawal.
                      </div>
                    }
                    labelClassName="text-white/80 text-xs font-sans underline underline-offset-4 decoration-dotted decoration-gray-600"
                  />
                  <span className="flex-1 border-b border-dashed border-[#505050] mx-2"></span>
                  <FormatUsdCollateralAmount
                    className="font-mono"
                    collateralClassName="w-4 h-4"
                    collateralIcon={unit}
                    text={formatCollateralUsdNumber({
                      value_usd: userHoldingData?.user_break_event_price_usd,
                      value_collateral:
                        userHoldingData?.user_break_event_price_collateral,
                      isUsd,
                      unit,
                    })}
                  />
                </div>
              </HoldingCard>
            </motion.div>
          )}
        </AnimatePresence>
      </ConditionRenderer>
    </DetailWrapper>
  );
};

export default YourHoldings;
