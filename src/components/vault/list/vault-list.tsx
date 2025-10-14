import { GradientSelect } from "@/components/ui/gradient-select";
import { InputSearch } from "@/components/ui/input-search";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import Web3Button from "@/components/ui/web3-button";
import { ButtonGradient } from "@/components/ui/button-gradient";
import { SORT_TYPE } from "@/config/constants-types";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { getPathVaultDetail } from "@/config/router";
import {
  useGetDepositVaults,
  useNdlpAssetsStore,
  useGetVaultsWithdrawal,
  useRefreshAssetsBalance,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { useWithdrawVault } from "@/hooks/use-withdraw-vault";
import { formatPercentage } from "@/lib/utils";
import { formatNumber, showFormatNumber } from "@/lib/number";
import {
  DepositVaultConfig,
  UserHoldingTokens,
  VaultApr,
} from "@/types/vault-config.types";
import { calculateUserHoldings } from "@/utils/helpers";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { VaultItem } from "./vault-item";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import VaultItemMobile from "./vault-item-mobile";
import VaultHolding from "./vault-holding";
import VaultRewards from "./vault-rewards";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TVLCell } from "./tvl-cell";

const OPTIONS_CHAINS = [
  { value: "all", label: "All Chains" },
  {
    value: "sui",
    label: "SUI",
    icon: <img src="/chains/sui.png" alt="SUI" className="w-5 h-5" />,
  },
  {
    value: "bsc",
    label: "BSC",
    disabled: true,
    icon: <img src="/chains/bsc.png" alt="BSC" className="w-5 h-5" />,
    left: (
      <div
        className="text-white text-[10px] px-2"
        style={{
          borderRadius: "90px",
          border: "0.5px solid #FFE8C9",
        }}
      >
        Coming Soon
      </div>
    ),
  },
];

export type TokenPool = {
  name: string;
  image: string;
  min_deposit_amount?: string | number;
  min_deposit_amount_usd?: string | number;
};

type Withdrawing = {
  receive_amount_usd: string;
  countdown: number;
  is_over_time: boolean;
  is_ready: boolean;
};

export type VaultItemData = DepositVaultConfig &
  VaultApr & {
    exchange_name: string;
    exchange_image: string;
    exchange_code: string;
    token_pools: TokenPool[];
    user_holdings: number;
    user_holdings_show?: string | number;
    total_value_usd_show?: string | number;
    rewards_24h_usd_show?: string | number;
    vault_apy_show?: string | number;
    rewards_earned_show?: string;
    is_loading_withdrawal: boolean;
    withdrawing: Withdrawing | null;
    change_24h: UserHoldingTokens[];
  };

const HOLDING_TYPE = [
  {
    label: "Token",
    value: "token",
  },
  {
    label: "USD",
    value: "usd",
  },
];

const HIDDEN_VAULT_IDS = ["0xvault-btc-eth"];

const mockAPYData = {
  rolling_7day_apr: "118.62",
  nodo_incentive_apr: "7.44",
  campaign_aprs: [
    {
      label: "OKX",
      apr: 50.39,
    },
  ],
  total_apr_precompounding: "78.30",
  daily_compounding_apy: "118.62",
  nodo_incentives: [
    {
      token_symbol: "USDC",
      daily_amount: 3000,
    },
  ],
};

const DESKTOP_GRID_TEMPLATE =
  "grid grid-cols-[minmax(320px,1fr)_140px_160px_180px_120px_140px] items-center";
const DESKTOP_CELL_PADDING = "px-6 py-4";
const HEADER_TEXT_CLASS = "text-sm font-semibold text-white/70";
const NUMERIC_CELL_CLASS = "text-right tabular-nums text-white/90";

export default function VaultList() {
  const { isLoading, data = [] } = useGetDepositVaults();
  const {
    isLoading: isLoadingWithdrawal,
    data: dataWithdrawals = [],
    refetch: refetchVaultsWithdrawal,
  } = useGetVaultsWithdrawal();
  const { redeemWithVaultId } = useWithdrawVault();
  const navigate = useNavigate();
  const { assets: ndlpAssets } = useNdlpAssetsStore();
  const { refreshAllBalance } = useRefreshAssetsBalance();
  const { isMd } = useBreakpoint();

  const [dex, setDex] = useState<string[]>(["all"]);
  const [chains, setChains] = useState<string[]>(["all"]);
  const [search, setSearch] = useState<string>("");
  const [idLoadingClaim, setIdLoadingClaim] = useState("");
  const [idsClaimed, setIdsClaimed] = useState<string[]>([]);
  const [paramsSort, setParamsSort] = useState({
    total_value_usd: SORT_TYPE.desc,
    // total_value_usd: SORT_TYPE.desc,
    // rewards_24h_usd: SORT_TYPE.desc,
    // user_holdings: SORT_TYPE.desc,
    keySort: "total_value_usd",
  });
  const [holdingShowMode, setHoldingShowMode] = useState<string>(
    HOLDING_TYPE[0].value
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const showUsd = (num, emty = "--") => {
    return num ? showFormatNumber(num, 2, 2, "$") : emty;
  };

  const mapData = useMemo(() => {
    return data
      .filter((vault) => !HIDDEN_VAULT_IDS.includes(vault.vault_id))
      .map((vault) => {
        const ndlpBalance =
          ndlpAssets.find((asset) => asset.coin_type === vault.vault_lp_token)
            ?.balance || "0";
        const user_holdings = Number(
          calculateUserHoldings(
            ndlpBalance,
            vault?.user_pending_withdraw_ndlp,
            vault?.vault_lp_token_decimals,
            vault?.ndlp_price_usd
          )
        );
        const vault_apy = Number(vault?.vault_apy || 0);
        const exchange = EXCHANGE_CODES_MAP[vault?.exchange_id];
        const tokens = vault.pool.pool_name.split("-");

        const withdrawal_vault = dataWithdrawals?.find(
          (i) => vault.vault_id === i.vault_id
        );
        let withdrawal = null;
        if (
          withdrawal_vault &&
          withdrawal_vault.withdrawals.length &&
          !idsClaimed.includes(vault.vault_id)
        ) {
          const tmp = withdrawal_vault.withdrawals[0];
          withdrawal = {
            receive_amount_usd: showUsd(tmp.receive_amount_usd),
            countdown: tmp.countdown,
            is_over_time: new Date().getTime() >= tmp.countdown,
            is_ready: tmp.is_ready,
          };
        }

        return {
          ...vault,
          exchange_name: exchange.name,
          exchange_image: exchange.image,
          exchange_code: exchange.code,
          user_holdings: user_holdings,
          token_pools: tokens.map((i) => {
            const token = vault.tokens.find((v) => v.token_symbol === i);
            return {
              name: i,
              image: `/coins/${i?.toLowerCase()}.png`,
              min_deposit_amount: token?.min_deposit_amount,
              min_deposit_amount_usd: token?.min_deposit_amount_usd,
            };
          }),

          user_holdings_show: showUsd(user_holdings),
          total_value_usd_show: showUsd(vault?.total_value_usd),
          rewards_24h_usd_show: showUsd(vault?.rewards_24h_usd),
          vault_apy_show: vault?.vault_apy
            ? formatPercentage(vault_apy < 0 ? 0 : vault_apy)
            : "--",
          rewards_earned_show: !Number(user_holdings)
            ? "--"
            : "+" + showUsd(withdrawal_vault?.user_reward_earned_usd || "0"),
          is_loading_withdrawal: isLoadingWithdrawal,
          withdrawing: withdrawal,
        };
      }) as VaultItemData[];
  }, [data, ndlpAssets, isLoadingWithdrawal, dataWithdrawals, idsClaimed]);

  // Filter logic: if 'all' is selected, show all; else filter by selected DEXs
  const filteredData = useMemo(
    () =>
      mapData.filter((vault) => {
        return (
          (!search ||
            vault.vault_name.toLowerCase().includes(search.toLowerCase()) ||
            vault.exchange_name.toLowerCase().includes(search.toLowerCase())) &&
          (dex.includes("all") || dex.includes(vault.exchange_id?.toString()))
        );
      }),
    [search, dex, mapData]
  );

  const sortedData = useMemo(() => {
    return filteredData.sort((a, b) => {
      if (paramsSort[paramsSort.keySort] === SORT_TYPE.asc) {
        return a[paramsSort.keySort] - b[paramsSort.keySort];
      }
      return b[paramsSort.keySort] - a[paramsSort.keySort];
    });
  }, [filteredData, paramsSort]);

  const dexOptions = useMemo(() => {
    return Array.from(new Set(data.map((vault) => vault?.exchange_id)));
  }, [data]);

  const handleRowClick = useCallback(
    (el: any) => {
      navigate(getPathVaultDetail(el.vault_id));
    },
    [navigate]
  );

  const onClaim = useCallback(
    async (data: any) => {
      setIdLoadingClaim(data.vault_id);
      const res = await redeemWithVaultId(data.vault_id);
      if (res) {
        setIdsClaimed([...idsClaimed, data.vault_id]);
        setTimeout(() => {
          refreshAllBalance();
        }, 2000);
      }
      setIdLoadingClaim("");
    },
    [redeemWithVaultId, refreshAllBalance, idsClaimed]
  );

  const handleSort = useCallback(
    async (key: "total_value_usd" | "rewards_24h_usd" | "user_holdings") => {
      const _params = { ...paramsSort, keySort: key };
      _params[key] =
        _params[key] == SORT_TYPE.desc ? SORT_TYPE.asc : SORT_TYPE.desc;
      setParamsSort(_params);
    },
    [paramsSort]
  );

  const renderSortIcon = (
    key: "total_value_usd" | "rewards_24h_usd" | "user_holdings"
  ) => {
    const isActive = paramsSort.keySort === key;
    const direction =
      (paramsSort as Record<string, SORT_TYPE | undefined>)[key] ??
      SORT_TYPE.desc;

    if (!isActive) {
      return (
        <ArrowDown className="h-4 w-4 text-white/40 opacity-0 transition-opacity duration-150 group-hover:opacity-50" />
      );
    }

    return direction === SORT_TYPE.desc ? (
      <ArrowDown className="h-4 w-4 text-white/80" />
    ) : (
      <ArrowUp className="h-4 w-4 text-white/80" />
    );
  };

  const optionDexs = useMemo(() => {
    return [
      { value: "all", label: "All DEXs" },
      ...dexOptions.map((item) => ({
        value: item.toString(),
        label: EXCHANGE_CODES_MAP[item].name,
        icon: (
          <img
            src={EXCHANGE_CODES_MAP[item].image}
            alt={EXCHANGE_CODES_MAP[item].name}
            className="w-5 h-5"
          />
        ),
      })),
    ];
  }, [dexOptions]);

  useEffect(() => {
    const hasClaim = mapData.find((i) => i?.withdrawing?.is_ready === false);

    if (hasClaim) {
      intervalRef.current = setInterval(() => {
        refetchVaultsWithdrawal();
      }, 30000); // 30s
    }

    if (!hasClaim && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  return (
    <>
      <div className="w-full mx-auto max-md:p-4 max-md:rounded-lg max-md:pt-6 max-md:bg-[#121212]">
      {isMd && (
        <div
          className="text-white font-sans text-[22px] font-bold leading-normal tracking-[-1.2px] mb-6"
          style={{ fontFamily: '"DM Sans"' }}
        >
          Live Vaults
        </div>
      )}
      <div
        className={cn(
          "flex flex-col md:flex-row md:items-center md:justify-between rounded-t-md",
          isMd ? "gap-4 bg-[#292929] px-6 py-4" : "gap-4"
        )}
      >
        <div className="w-full md:w-80 md:max-w-1/2">
          <InputSearch
            className="bg-black text-white placeholder:text-white/60 w-full rounded-lg px-4 py-2 border border-white/20 pl-9 focus-visible:ring-1 focus-visible:ring-white/70"
            placeholder="Search AI vaults..."
            onChange={(value) => setSearch(value)}
            debounceTime={300}
          />
        </div>
        <div className="flex gap-3">
          <GradientSelect
            options={OPTIONS_CHAINS}
            placeholder="All Chains"
            value={chains}
            onChange={setChains}
          />
          <GradientSelect
            options={optionDexs}
            placeholder="All DEXs"
            value={dex}
            onChange={setDex}
          />
        </div>
      </div>
      <ConditionRenderer
        when={isMd}
        fallback={
          <div className="pt-6">
            <ConditionRenderer
              when={sortedData?.length > 0}
              fallback={
                <ConditionRenderer
                  when={isLoading}
                  fallback={
                    <div className="flex flex-col gap-4">
                      <p className="text-white text-center text-sm">
                        No vaults found
                      </p>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[270px] w-full animate-pulse rounded bg-white/10"
                      />
                    ))}
                  </div>
                </ConditionRenderer>
              }
            >
              {sortedData.map((item) => (
                <VaultItemMobile
                  key={item.vault_id}
                  item={item}
                  idLoadingClaim={idLoadingClaim}
                  reloadDataWithdraw={refetchVaultsWithdrawal}
                  onRowClick={handleRowClick}
                  onClaim={onClaim}
                  HOLDING_TYPE={HOLDING_TYPE}
                  holdingShowMode={holdingShowMode}
                  setHoldingShowMode={setHoldingShowMode}
                />
              ))}
            </ConditionRenderer>
          </div>
        }
      >
        <div className="rounded-md border border-t-0 border-[rgba(255, 255, 255, 0.20)] bg-[#181818] rounded-t-none overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div
                className={cn(
                  DESKTOP_GRID_TEMPLATE,
                  DESKTOP_CELL_PADDING,
                  "border-b border-white/10 bg-[#181818]"
                )}
              >
                <div className={cn("flex items-center gap-2 pl-2", HEADER_TEXT_CLASS)}>
                  <LabelWithTooltip
                    hasIcon={false}
                    label="AI Vaults"
                    labelClassName="text-white/80 text-left text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                    tooltipContent="Trading pair and DEX name"
                  />
                </div>
                <div
                  className={cn(
                    "group flex cursor-pointer select-none items-center justify-end gap-2",
                    HEADER_TEXT_CLASS
                  )}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSort("total_value_usd")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSort("total_value_usd");
                    }
                  }}
                >
                  <LabelWithTooltip
                    hasIcon={false}
                    label="TVL"
                    labelClassName="text-white/80 text-right text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                    tooltipContent={
                      <div className="text-xs">
                        Total USD value of all vault assets. Updates live.{" "}
                        <span className="text-[#FFBD24] text-xs font-bold">
                          (USD equivalent)
                        </span>
                      </div>
                    }
                  />
                  {renderSortIcon("total_value_usd")}
                </div>
                <div
                  className={cn(
                    "group flex cursor-pointer select-none items-center justify-end gap-2",
                    HEADER_TEXT_CLASS
                  )}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSort("rewards_24h_usd")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSort("rewards_24h_usd");
                    }
                  }}
                >
                  <LabelWithTooltip
                    hasIcon={false}
                    label="24h Rewards"
                    labelClassName="text-white/80 text-right text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                    tooltipContent={
                      <div className="text-xs">
                        Total LP fees and token incentives earned by the vault in
                        the last 24 hours
                        <span className="text-[#FFBD24] text-xs font-bold">
                          {" "}
                          (USD equivalent)
                        </span>
                        . Updates every 1 hour.
                      </div>
                    }
                  />
                  {renderSortIcon("rewards_24h_usd")}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div
                    className={cn(
                      "group flex cursor-pointer select-none items-center justify-end gap-2",
                      HEADER_TEXT_CLASS
                    )}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSort("user_holdings")}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSort("user_holdings");
                      }
                    }}
                  >
                    <LabelWithTooltip
                      hasIcon={false}
                      label="Your Holdings"
                      labelClassName="text-white/80 text-right text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                      tooltipContent={
                        <div className="text-xs">
                          The total value of your position in the vault, including
                          both principal and accrued rewards
                          <span className="text-[#FFBD24] text-xs font-bold">
                            {" "}
                            (USD equivalent)
                          </span>
                          . Updates every 1 hour.
                        </div>
                      }
                    />
                    {renderSortIcon("user_holdings")}
                  </div>
                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    <Tabs value={holdingShowMode} onValueChange={setHoldingShowMode}>
                      <TabsList className="flex gap-1 p-1">
                        {HOLDING_TYPE.map((tab, index) => (
                          <TabsTrigger
                            key={`holding-type-${index}`}
                            value={tab.value}
                            className="!text-xs"
                          >
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
                <div className={cn("flex justify-center", HEADER_TEXT_CLASS)}>
                  <LabelWithTooltip
                    hasIcon={false}
                    label="Rewards"
                    labelClassName="text-white/80 text-center text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                    tooltipContent="Total rewards earned in this vault are automatically compounded into your liquidity and updated every hour."
                  />
                </div>
                <div className={cn("flex justify-end text-right", HEADER_TEXT_CLASS)}>
                  Action
                </div>
              </div>
              <div>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`vault-loading-${index}`}
                      className={cn(
                        DESKTOP_GRID_TEMPLATE,
                        DESKTOP_CELL_PADDING,
                        index === 0 ? "" : "border-t border-white/10"
                      )}
                    >
                      {[0, 1, 2, 3, 4, 5].map((cell) => (
                        <div
                          key={`vault-loading-${index}-${cell}`}
                          className={cn(
                            "flex",
                            cell === 0 ? "justify-start" : "justify-end"
                          )}
                        >
                          <Skeleton
                            className={cn(
                              "h-5 rounded",
                              cell === 0 ? "w-40" : cell === 5 ? "w-24" : "w-28"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  ))
                ) : sortedData.length > 0 ? (
                  sortedData.map((item, index) => {
                    const collateralToken = item.tokens.find(
                      (token) => token.token_address === item.collateral_token
                    );
                    const tokenSymbol = collateralToken?.token_symbol;
                    const tokenIconUrl =
                      collateralToken?.icon_url ??
                      (tokenSymbol
                        ? `/coins/${tokenSymbol.toLowerCase()}.png`
                        : undefined);
                    const capValue =
                      item.capacity_usd ??
                      item.tvl_cap_usd ??
                      item.total_value_cap;
                    const capUsd =
                      capValue == null ? undefined : Number(capValue) || undefined;
                    const withdrawal = item.withdrawing;
                    return (
                      <div key={item.vault_id}>
                        <div
                          className={cn(
                            DESKTOP_GRID_TEMPLATE,
                            DESKTOP_CELL_PADDING,
                            index === 0 ? "" : "border-t border-white/10",
                            "cursor-pointer transition-colors hover:bg-white/5"
                          )}
                          onClick={() => handleRowClick(item)}
                        >
                          <div className="min-w-0 pr-4">
                            <VaultItem item={item} />
                          </div>
                          <div className="ml-auto flex justify-end">
                            <TVLCell
                              align="end"
                              tvlUsd={Number(item.total_value_usd) || 0}
                              capUsd={capUsd}
                              tokenIconUrl={tokenIconUrl}
                              tokenSymbol={tokenSymbol}
                            />
                          </div>
                          <div className={cn(NUMERIC_CELL_CLASS, "font-mono text-base")}>
                            {item.rewards_24h_usd_show}
                          </div>
                          <div className="flex flex-col items-end gap-1 text-right">
                            {holdingShowMode === HOLDING_TYPE[0].value ? (
                              item.change_24h && item.change_24h.length > 0 ? (
                                item.change_24h.map((token, tokenIndex) => (
                                  <div
                                    key={`${item.vault_id}-holding-token-${tokenIndex}`}
                                    className="flex items-center justify-end gap-2 font-mono text-sm text-white"
                                  >
                                    <img
                                      src={`coins/${token.token_symbol?.toLowerCase()}.png`}
                                      alt={token.token_name}
                                      className="h-4 w-4"
                                    />
                                    <span className="max-w-[160px] truncate tabular-nums">
                                      {Number(token.amount) > 0
                                        ? formatNumber(
                                            token.amount,
                                            0,
                                            Number(token.amount) < 1 ? 6 : 2
                                          )
                                        : "--"}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex flex-col items-end font-mono text-base">
                                  <span className="text-white">--</span>
                                  <span className="text-green-increase">--</span>
                                </div>
                              )
                            ) : (
                              <div className="truncate text-base font-mono font-medium text-white tabular-nums">
                                {item.user_holdings_show}
                              </div>
                            )}
                            {item.is_loading_withdrawal ? (
                              <Skeleton className="mt-1 h-5 w-[90px]" />
                            ) : null}
                          </div>
                          <div className="flex justify-center">
                            <VaultRewards item={item} />
                          </div>
                          <div className="flex justify-end">
                            <Web3Button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRowClick(item);
                              }}
                              className="h-9 px-4 text-sm"
                            >
                              Deposit
                            </Web3Button>
                          </div>
                        </div>
                        {withdrawal ? (
                          <div
                            className={cn(
                              DESKTOP_GRID_TEMPLATE,
                              DESKTOP_CELL_PADDING,
                              "border-t border-white/10",
                              withdrawal.is_ready
                                ? "bg-green-increase/20"
                                : "bg-amber-600/20"
                            )}
                          >
                            <div className="col-span-5 flex justify-end">
                              <VaultHolding
                                item={item}
                                isOnlyWithdrawing={true}
                                reloadData={refetchVaultsWithdrawal}
                              />
                            </div>
                            <div className="flex justify-end">
                              <ButtonGradient
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  onClaim(item);
                                }}
                                variant="outline"
                                className="h-9 w-[96px]"
                                classButtonInner={
                                  withdrawal.is_ready
                                    ? "bg-green-increase/20"
                                    : "bg-amber-600/20"
                                }
                                loading={idLoadingClaim === item.vault_id}
                                disabled={
                                  !!idLoadingClaim || withdrawal.is_ready !== true
                                }
                                hideContentOnLoading={true}
                              >
                                Claim
                              </ButtonGradient>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="border-t border-white/10">
                    <div className="px-6 py-16 text-center text-white/60">
                      No vaults found
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ConditionRenderer>
    </div>

    </>
  );
}
