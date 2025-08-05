import { GradientSelect } from "@/components/ui/gradient-select";
import { InputSearch } from "@/components/ui/input-search";
import { LabelWithTooltip } from "@/components/ui/label-with-tooltip";
import { TableRender } from "@/components/ui/table-render";
import Web3Button from "@/components/ui/web3-button";
import { SORT_TYPE } from "@/config/constants-types";
import { EXCHANGE_CODES_MAP } from "@/config/vault-config";
import {
  useGetDepositVaults,
  useNdlpAssetsStore,
  useVaultObjectStore,
  useWallet,
} from "@/hooks";
import { formatPercentage } from "@/lib/utils";
import { DepositVaultConfig } from "@/types/vault-config.types";
import { formatCurrency } from "@/utils/currency";
import { calculateUserHoldings } from "@/utils/helpers";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { VaultItem } from "./vault-item";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

export type VaultItemData = DepositVaultConfig & {
  exchange_name: string;
  user_holdings: number;
};
const campaign_data = {
  "SUI-USDC-cetus": {
    usdc: 1250,
    xp: 500000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
  "SUI-USDC-mmt": {
    usdc: 2500,
    xp: 500000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
  "DEEP-SUI-mmt": {
    usdc: 1250,
    xp: 500000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
  "WAL-SUI-mmt": {
    usdc: 1250,
    xp: 500000000,
    startDate: "28/07/2025",
    endDate: "15/08/2025",
    snapshotDate: "14/08/2025, 3PM SGT",
  },
};

export default function VaultList() {
  const { isLoading, data = [] } = useGetDepositVaults();
  const [searchParams, setSearchParams] = useSearchParams();

  const [dex, setDex] = useState<string[]>(["all"]);
  const [chains, setChains] = useState<string[]>(["all"]);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();
  const { vaultObjects } = useVaultObjectStore();
  const { assets: ndlpAssets } = useNdlpAssetsStore();
  const { isAuthenticated } = useWallet();

  const [paramsSort, setParamsSort] = useState(() => {
    const sortKey = searchParams.get("sortKey") || "vault_apy";
    const sortValue = searchParams.get("sortValue") || SORT_TYPE.desc;
    return {
      key: sortKey,
      value: sortValue as typeof SORT_TYPE.desc,
    };
  });

  const mapData = useMemo(() => {
    return data.map((vault) => {
      const vaultConfig = vaultObjects.find(
        (vo) => vo.vault_id === vault.vault_id
      );
      const ndlpBalance =
        ndlpAssets.find((asset) => asset.coin_type === vault.vault_lp_token)
          ?.balance || "0";

      const campaignName = `${vault.vault_name}-${
        EXCHANGE_CODES_MAP[vault?.exchange_id].code
      }`;

      return {
        ...vault,
        exchange_name: EXCHANGE_CODES_MAP[vault?.exchange_id].name,
        user_holdings: isAuthenticated
          ? Number(
              calculateUserHoldings(
                vaultConfig,
                ndlpBalance,
                vault?.user_pending_withdraw_ndlp
              )
            )
          : 0,
        campaign_data: campaign_data[campaignName],
      };
    });
  }, [data, vaultObjects, ndlpAssets, isAuthenticated]);

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
      if (paramsSort.value === SORT_TYPE.asc) {
        return a[paramsSort.key] - b[paramsSort.key];
      }
      return b[paramsSort.key] - a[paramsSort.key];
    });
  }, [filteredData, paramsSort]);

  const dexOptions = useMemo(() => {
    return Array.from(new Set(data.map((vault) => vault?.exchange_id)));
  }, [data]);

  const handleRowClick = useCallback(
    (el: any) => {
      navigate(`/vault/${el.vault_id}`);
    },
    [navigate]
  );

  const columns = useMemo(
    () => [
      {
        title: "AI Vaults",
        dataIndex: "vault_name",
        classCell: "align-middle",
        classTitle: "text-white/80 text-left w-[320px]", // 290px if 24h column is added
        render: (_, record: DepositVaultConfig) => <VaultItem item={record} />,
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="TVL"
            labelClassName="text-white/80 text-left text-[16px]"
            tooltipContent="Total Value Locked - the combined USD value of all assets currently managed by this vault's AI strategy."
          />
        ),
        dataIndex: "tvl",
        classTitle: "w-[250px]",
        classCell: "align-middle",
        keySort: "total_value_usd",
        render: (value: any, record: any) => (
          <span className="text-white font-medium font-mono text-base">
            {record.total_value_usd
              ? formatCurrency(
                  record.total_value_usd,
                  0,
                  2,
                  2,
                  "currency",
                  "USD"
                )
              : "--"}
          </span>
        ),
      },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="APY"
            labelClassName="text-white/80 text-left text-[16px]"
            tooltipContent="Projected annual returns with compounding. Based on current 24-hour fee generation and AI rebalancing performance."
          />
        ),
        dataIndex: "apy",
        classTitle: "text-white/80 text-left", // 120px if 24h column is added
        classCell: "align-middle",
        keySort: "vault_apy",
        render: (value: any, record: any) => (
          <span className="text-[#64EBBC] font-medium font-mono text-base">
            {record.vault_apy
              ? `${formatPercentage(
                  record.vault_apy < 0 ? 0 : record.vault_apy
                )}`
              : "--"}
          </span>
        ),
      },
      // {
      //   title: "24h Rewards",
      //   dataIndex: "rewards",
      //   classTitle: "text-white/80 text-left w-[140px]",
      //   classCell: "align-middle",
      //   keySort: "rewards_24h_usd",
      //   render: (value: any, record: any) => (
      //     <span className="text-white font-medium font-mono text-base">
      //       {record.rewards_24h_usd
      //         ? formatCurrency(
      //             record.rewards_24h_usd,
      //             0,
      //             0,
      //             2,
      //             "currency",
      //             "USD"
      //           )
      //         : "--"}
      //     </span>
      //   ),
      // },
      {
        title: (
          <LabelWithTooltip
            hasIcon={false}
            label="Your Holdings"
            labelClassName="text-white/80 text-left text-[16px]"
            tooltipContent="Your current investment value in this vault. Updates in real-time based on vault performance and NDLP price."
          />
        ),
        dataIndex: "holdings",
        classTitle: "text-white/80 justify-end", // 140px if 24h column is added
        classCell: "align-middle justify-end", // 140px if 24h column is added
        keySort: "user_holdings",
        render: (_: any, record: any) => (
          <span className="text-white font-medium font-mono text-base">
            {record.user_holdings
              ? `${formatCurrency(
                  record.user_holdings,
                  0,
                  2,
                  2,
                  "currency",
                  "USD"
                )}`
              : "$--"}
          </span>
        ),
      },
      {
        title: "Rewards",
        dataIndex: "rewards",
        classTitle: "text-white/80 justify-end",
        classCell: "align-middle justify-end",
        render: (_: any, record: any) => {
          return (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <img src="/coins/usdc.png" alt="usdc" className="w-5 h-5" />
                    <img
                      src="/coins/xp.png"
                      alt="xp"
                      className="w-5 h-5 ml-[-4px]"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="shadow-[0_2px_4px_rgba(255,255,255,0.25)] p-3 max-w-[300px]">
                  <div>
                    <div className="text-sm bg-clip-text text-transparent bg-[linear-gradient(90deg,_#FFE8C9_0%,_#F9F4E9_25%,_#E3F6FF_60%,_#C9D4FF_100%)] mb-3 font-medium">
                      TOTAL REWARD POOL
                    </div>
                    <hr />
                    <div className="flex items-center gap-2 min-w-[200px] mb-1 mt-2">
                      <img
                        src="/coins/usdc.png"
                        alt="usdc"
                        className="w-5 h-5"
                      />
                      <span className="text-sm text-white font-mono font-normal">
                        {record.campaign_data
                          ? formatCurrency(
                              record.campaign_data.usdc,
                              0,
                              0,
                              0,
                              "decimal",
                              "USD"
                            )
                          : "--"}{" "}
                        USDC
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[200px] mb-1">
                      <img src="/coins/xp.png" alt="NDLP" className="w-5 h-5" />
                      <span className="text-sm  text-white font-mono font-normal">
                        {record.campaign_data
                          ? formatCurrency(
                              record.campaign_data.xp,
                              0,
                              0,
                              0,
                              "decimal",
                              "USD"
                            )
                          : "--"}{" "}
                        XP Shares
                      </span>
                    </div>
                    <div className="rounded-md bg-[#242424] p-2 mt-2 font-sans font-normal text-xs">
                      All rewards will be distributed at the end of the
                      campaign, based on your average deposit over the 14-day
                      period and the duration your funds were kept in the vault.
                      The larger your deposit and the longer it remains, the
                      greater your share of the rewards per vault.
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      },
      {
        title: "Action",
        dataIndex: "action",
        classTitle: "justify-end",
        classCell: "align-middle justify-end",
        render: (_: any, record: any) => (
          <Web3Button onClick={() => handleRowClick(record)}>
            Deposit
          </Web3Button>
        ),
      },
    ],
    [handleRowClick]
  );

  const handleSort = (key: string) => {
    setParamsSort((prev) => {
      if (prev.key === key) {
        return {
          key,
          value: prev.value === SORT_TYPE.asc ? SORT_TYPE.desc : SORT_TYPE.asc,
        };
      }
      return { key, value: SORT_TYPE.desc };
    });
  };

  const optionDexs = useMemo(() => {
    return [
      { value: "all", label: "All DEXs" },
      ...dexOptions.map((item) => ({
        value: item.toString(),
        label: EXCHANGE_CODES_MAP[item].name,
        icon: (
          <img
            src={`/dexs/${EXCHANGE_CODES_MAP[item].code}.png`}
            alt={EXCHANGE_CODES_MAP[item].name}
            className="w-5 h-5"
          />
        ),
      })),
    ];
  }, [dexOptions]);

  return (
    <div className="w-full mx-auto max-md:px-3 max-md:py-3 max-md:rounded-lg max-md:pt-6 max-md:bg-[#121212]">
      <div
        className="text-white font-sans text-[22px] font-bold leading-normal tracking-[-1.2px] mb-6"
        style={{ fontFamily: '"DM Sans"' }}
      >
        Live Vaults
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:bg-[#292929] md:px-6 md:py-4 rounded-b-none rounded-md">
        <InputSearch
          className="bg-black text-white placeholder:text-white/60 w-full md:w-80 rounded-lg px-4 py-2 border border-white/20 pl-9 focus-visible:ring-1 focus-visible:ring-white/70"
          placeholder="Search AI vaults..."
          onChange={(value) => setSearch(value)}
          debounceTime={300}
        />
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
      <div className="rounded-md overflow-hidden bg-[#181818] border border-t-0 rounded-t-none border-[rgba(255, 255, 255, 0.20)]">
        <TableRender
          headerClassName="p-4 h-[70px] border-b"
          data={sortedData}
          columns={columns}
          isLoading={isLoading}
          labelNodata="No vaults found"
          paramsSearch={paramsSort}
          changeSort={handleSort}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
