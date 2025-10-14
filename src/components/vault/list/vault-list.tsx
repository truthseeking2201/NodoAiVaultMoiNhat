import { GradientSelect } from "@/components/ui/gradient-select";
import { InputSearch } from "@/components/ui/input-search";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { SORT_TYPE } from "@/config/constants-types";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import { getPathVaultDetail } from "@/config/router";
import {
  useGetDepositVaults,
  useNdlpAssetsStore,
} from "@/hooks";
import { cn, formatPercentage } from "@/lib/utils";
import { formatNumber, showFormatNumber } from "@/lib/number";
import {
  DepositVaultConfig,
  UserHoldingTokens,
  VaultApr,
} from "@/types/vault-config.types";
import { calculateUserHoldings } from "@/utils/helpers";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VaultItem } from "./vault-item";
import useBreakpoint from "@/hooks/use-breakpoint";
import ConditionRenderer from "@/components/shared/condition-renderer";
import VaultItemMobile from "./vault-item-mobile";
import VaultRewards from "./vault-rewards";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp } from "lucide-react";

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

const DESKTOP_GRID_TEMPLATE =
  "grid grid-cols-[minmax(320px,1fr)_160px_140px_180px_120px_140px] items-center";
const DESKTOP_CELL_PADDING = "px-4 py-3";
const HEADER_TEXT_CLASS = "text-sm font-semibold text-white/70";
const NUMERIC_CELL_CLASS = "text-right tabular-nums text-white/90";

export default function VaultList() {
  const { isLoading, data = [] } = useGetDepositVaults();
  const navigate = useNavigate();
  const { assets: ndlpAssets } = useNdlpAssetsStore();
  const { isMd } = useBreakpoint();

  const [dex, setDex] = useState<string[]>(["all"]);
  const [chains, setChains] = useState<string[]>(["all"]);
  const [search, setSearch] = useState<string>("");
  const [paramsSort, setParamsSort] = useState({
    total_value_usd: SORT_TYPE.desc,
    vault_apy: SORT_TYPE.desc,
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
        };
      }) as VaultItemData[];
  }, [data, ndlpAssets]);

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

  const handleSort = useCallback(
    async (key: "total_value_usd" | "vault_apy") => {
      const _params = { ...paramsSort, keySort: key };
      _params[key] =
        _params[key] == SORT_TYPE.desc ? SORT_TYPE.asc : SORT_TYPE.desc;
      setParamsSort(_params);
    },
    [paramsSort]
  );

  const renderSortIcon = (key: "total_value_usd" | "vault_apy") => {
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
                  onRowClick={handleRowClick}
                  HOLDING_TYPE={HOLDING_TYPE}
                  holdingShowMode={holdingShowMode}
                  setHoldingShowMode={setHoldingShowMode}
                />
              ))}
            </ConditionRenderer>
          </div>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-[#121317] overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1180px]">
              <div
                className={cn(
                  DESKTOP_GRID_TEMPLATE,
                  DESKTOP_CELL_PADDING,
                  "border-y border-white/10 bg-[#181818]"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2 pl-2 text-left",
                    HEADER_TEXT_CLASS
                  )}
                >
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
                  onClick={() => handleSort("vault_apy")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSort("vault_apy");
                    }
                  }}
                >
                  <LabelWithTooltip
                    hasIcon={false}
                    label="APY"
                    labelClassName="text-white/80 text-right text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                    tooltipContent={
                      <div className="text-xs">
                        Annual percentage yield after compounding based on the
                        latest performance snapshot.
                      </div>
                    }
                  />
                  {renderSortIcon("vault_apy")}
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div className={cn(HEADER_TEXT_CLASS, "text-right")}>
                    <LabelWithTooltip
                      hasIcon={false}
                      label="Your Holdings"
                      labelClassName="text-white/80 text-right text-[16px] underline underline-offset-8 decoration-dotted decoration-gray-600"
                      tooltipContent={
                        <div className="text-xs">
                          The total value of your position in the vault,
                          including both principal and accrued rewards
                          <span className="text-[#FFBD24] text-xs font-bold">
                            {" "}
                            (USD equivalent)
                          </span>
                          . Updates every 1 hour.
                        </div>
                      }
                    />
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
                      {[0, 1, 2, 3, 4, 5].map((cell) => {
                        const widthClasses = [
                          "w-48",
                          "w-28",
                          "w-16",
                          "w-32",
                          "w-10",
                          "w-24",
                        ];
                        return (
                          <div
                            key={`vault-loading-${index}-${cell}`}
                            className={cn(
                              "flex",
                              cell === 0 ? "justify-start" : "justify-end"
                            )}
                          >
                            <Skeleton
                              className={cn(
                                "h-4 rounded",
                                widthClasses[cell] ?? "w-24"
                              )}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : sortedData.length > 0 ? (
                  sortedData.map((item, index) => {
                    const tokenDisplay = (() => {
                      if (!item.change_24h || item.change_24h.length === 0) {
                        return "--";
                      }
                      const formatted = item.change_24h
                        .map((token) => {
                          const amount = Number(token.amount);
                          if (!amount) return null;
                          const precision = amount < 1 ? 6 : 2;
                          return `${formatNumber(
                            amount,
                            0,
                            precision
                          )} ${token.token_symbol}`;
                        })
                        .filter(Boolean);
                      return formatted.length > 0 ? formatted.join(" • ") : "--";
                    })();

                    const holdingsDisplay =
                      holdingShowMode === HOLDING_TYPE[0].value
                        ? tokenDisplay
                        : (item.user_holdings_show as string) ?? "--";

                    const apyRaw =
                      item.daily_compounding_apy ?? item.vault_apy ?? "";
                    const apyNumeric = Number(apyRaw);
                    const apyDisplay =
                      !apyRaw || Number.isNaN(apyNumeric) || apyNumeric === 0
                        ? "--"
                        : formatPercentage(apyNumeric);

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
                          <div className="min-w-0 pr-2">
                            <VaultItem item={item} />
                          </div>
                          <div className={cn(NUMERIC_CELL_CLASS, "font-mono text-base")}>
                            {item.total_value_usd_show ?? "--"}
                          </div>
                          <div
                            className={cn(
                              NUMERIC_CELL_CLASS,
                              apyDisplay !== "--" ? "text-emerald-400 font-medium" : "text-white/70"
                            )}
                          >
                            {apyDisplay}
                          </div>
                          <div
                            className={cn(
                              NUMERIC_CELL_CLASS,
                              "truncate text-sm text-white/90"
                            )}
                            title={typeof holdingsDisplay === "string" ? holdingsDisplay : undefined}
                          >
                            {holdingsDisplay}
                          </div>
                          <div className="flex justify-center">
                            <VaultRewards item={item} />
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRowClick(item);
                              }}
                              className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/10 px-4 text-sm font-medium text-white/90 transition-colors hover:bg-white/15"
                            >
                              Deposit
                            </button>
                          </div>
                        </div>
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
