import { useCallback } from "react";
import { DetailWrapper } from "@/components/vault-detail/detail-wrapper";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ACTIVITIES_TABS } from "@/components/vault-detail/constant";
import { useState, useEffect } from "react";
import { TransactionHistory, Types, Transaction } from "@/types/vault";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, ArrowUpRight } from "lucide-react";
import SwapIcon from "@/assets/icons/swap.svg";
import { getVaultsActivities } from "@/apis/vault";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDate12Hours } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { CustomPagination } from "@/components/ui/custom-pagination";

const formatTime = (timestamp: string) => {
  const time_tmp = formatDate12Hours(timestamp).split(" ");
  if (time_tmp.length === 0) {
    return <div className="text-xs text-white/70 font-mono">--:--</div>;
  }

  return (
    <div>
      <div className="text-xs text-white/70 font-mono">{time_tmp[0]}</div>
      <div className="text-xs text-white/70 font-mono">
        {time_tmp[1]} {time_tmp[2]}
      </div>
    </div>
  );
};

const ITEMS_PER_PAGE = 5;
const ADD_LIQUIDITY_TYPES = [
  "ADD_LIQUIDITY",
  "OPEN",
  "ADD_PROFIT_UPDATE_RATE",
  "CLAIM_REWARDS",
];
const REMOVE_LIQUIDITY_TYPES = ["REMOVE_LIQUIDITY", "CLOSE"];
const SWAP_TYPES = ["SWAP"];

const renamingType = (type: string) => {
  switch (type) {
    case "ADD_LIQUIDITY":
      return "Add Liquidity";
    case "REMOVE_LIQUIDITY":
      return "Remove Liquidity";
    case "CLAIM_REWARDS":
      return "Add Reward";
    case "SWAP":
      return "Swap";
    case "ADD_PROFIT_UPDATE_RATE":
      return "Add Profit";
    case "OPEN":
      return "Open Position";
    case "CLOSE":
      return "Close Position";
    default:
      return type;
  }
};

interface VaultActivitiesProps {
  isDetailLoading: boolean;
  vault_id: string;
}

const VaultActivities = ({ isDetailLoading, vault_id }: VaultActivitiesProps) => {
  const [filter, setFilter] = useState<Types["type"][]>(["ALL"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastTotalPages, setLastTotalPages] = useState(1);

  const fetchVaultActivities = useCallback(
    async ({
      page = 1,
      limit = 5,
      action_type = "",
      vault_id = "",
    }: {
      page?: number;
      limit?: number;
      action_type?: string;
      vault_id?: string;
    }): Promise<TransactionHistory> => {
      try {
        const response = await getVaultsActivities({
          page,
          limit,
          action_type,
          vault_id,
        });

        if (response) {
          return response as TransactionHistory;
        }
      } catch (error) {
        console.error("Error fetching vault activities:", error);
      }
      return { list: [], total: 0, page: 1 } as TransactionHistory;
    },
    []
  );

  // Using React Query and set up pagination
  const { data, isFetching, isFetched } = useQuery({
    queryKey: ["activities", currentPage, filter],
    queryFn: () =>
      fetchVaultActivities({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        action_type: handleFormatFilter(filter),
        vault_id
      }),
    staleTime: 30000,
  });

  const listItems = data?.list ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const handleFormatFilter = useCallback((filter: Types["type"][]) => {
    if (filter.includes("ALL")) {
      return "";
    }
    if (filter.some((type) => SWAP_TYPES.includes(type))) {
      return "SWAP";
    }
    if (filter.some((type) => ADD_LIQUIDITY_TYPES.includes(type))) {
      return "ADD_LIQUIDITY";
    }
    if (filter.some((type) => REMOVE_LIQUIDITY_TYPES.includes(type))) {
      return "REMOVE_LIQUIDITY";
    }
    return "";
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [setCurrentPage, totalPages]
  );

  const handleFilterChange = useCallback(
    (newFilter: Types["type"][]) => {
      if (
        newFilter.length !== filter.length ||
        !newFilter.every((f, i) => f === filter[i])
      ) {
        setCurrentPage(1);
        setFilter(newFilter);
        fetchVaultActivities({
          page: 1,
          limit: ITEMS_PER_PAGE,
          action_type: handleFormatFilter(newFilter),
        });
      }
    },
    [fetchVaultActivities, handleFormatFilter, filter]
  );

  const handleSelectTransaction = useCallback((transaction: Transaction) => {
    if (transaction.txhash) {
      window.open(
        `https://suiscan.xyz/mainnet/tx/${transaction.txhash}`,
        "_blank"
      );
    }
  }, []);


  useEffect(() => {
    if (!isFetching && totalPages !== lastTotalPages) {
      setLastTotalPages(totalPages);
    }
  }, [isFetching, totalPages, lastTotalPages]);

  const displayTotalPages = isFetching ? lastTotalPages : totalPages;
  const paginatedTransactions = listItems;

  return (
    <DetailWrapper
      title="Vault Activities"
      titleComponent={
        <Tabs
          value={filter[0]}
          onValueChange={(value) =>
            handleFilterChange([value as Types["type"]])
          }
        >
          <TabsList className="p-1 flex gap-1">
            {ACTIVITIES_TABS.map((tab, index) => (
              <TabsTrigger key={`tab-${index}`} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      isLoading={isDetailLoading}
      loadingStyle="h-[447px] w-full"
    >
      <Table className="w-full border-0">
        <TableHeader className="border-b border-white/20">
          <TableRow className="border-b-0 border-white/10 hover:bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[140px] !px-0">
              Type
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[100px] px-2">
              Time
            </TableHead>

            <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[140px] px-2">
              Tokens
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[100px] px-2">
              Value
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[60px] !px-0 text-right">
              Tx Hash
            </TableHead>
          </TableRow>
        </TableHeader>
        <div className="mt-4" />
        <TableBody>
          {isFetching ? (
            Array(ITEMS_PER_PAGE)
              .fill(0)
              .map((_, i) => (
                <TableRow
                  key={i}
                  className={cn("hover:bg-white/5 w-full h-[70px] border-0")}
                >
                  {Array.from({ length: 5 }).map((_, col) => (
                    <TableCell
                      key={col}
                      className={cn("pr-0 pl-4 pt-3 border-0")}
                    >
                      <div className="h-5 bg-white/10 animate-pulse rounded mt-3"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
          ) : isFetched && paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((tx, index) => (
              <TableRow
                key={`transaction-${index}`}
                className={
                  "hover:bg-[#FFFFFF14] cursor-pointer h-[70px] border-0"
                }
                onClick={() => handleSelectTransaction(tx)}
              >
                <TableCell className={cn("pr-0 pl-4 pt-3 border-0")}>
                  <span
                    className={cn(
                      "inline-block text-xs font-medium px-2 py-1 rounded-md",
                      REMOVE_LIQUIDITY_TYPES.includes(tx.type) &&
                        "bg-[#F97316]/30 text-[#F97316]",
                      ADD_LIQUIDITY_TYPES.includes(tx.type) &&
                        "bg-[#22C55E]/20 text-[#22C55E]",
                      tx.type === "SWAP" && "bg-[#3B82F6]/30 text-[#3B82F6]"
                    )}
                  >
                    {ADD_LIQUIDITY_TYPES.includes(tx.type) && (
                      <Plus size={16} className="inline-block mr-1" />
                    )}
                    {REMOVE_LIQUIDITY_TYPES.includes(tx.type) && (
                      <ArrowUpRight size={16} className="inline-block mr-1" />
                    )}
                    {tx.type === "SWAP" && (
                      <img
                        src={SwapIcon}
                        alt="Swap"
                        className="inline-block mr-1"
                      />
                    )}

                    {renamingType(tx.type)}
                  </span>
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-xs text-white/70 px-2 pt-2 border-0"
                  )}
                >
                  {formatTime(tx.time)}
                </TableCell>

                <TableCell className={cn("p-2 border-0")}>
                  <div className="flex items-center justify-start gap-1">
                    <img
                      src={`/coins/${tx.tokens?.[0]?.token_symbol?.toLowerCase()}.png`}
                      alt={tx.tokens?.[0]?.token_name}
                      className="w-[18px] h-[18px] inline-flex items-center"
                    />
                    <span className="font-mono text-sm text-white">
                      {formatCurrency(
                        tx.tokens?.[0]?.amount || 0,
                        tx.tokens?.[0]?.decimal,
                        0,
                        2
                      )}{" "}
                      <span className="font-mono text-xs text-white/70">
                        {tx.tokens?.[0]?.token_symbol}
                      </span>
                    </span>
                  </div>
                  {tx.tokens?.[1] && tx.tokens?.[1]?.amount > 0 && (
                    <div className="flex items-center justify-start gap-1 mt-1">
                      <img
                        src={`/coins/${tx.tokens?.[1]?.token_symbol?.toLowerCase()}.png`}
                        alt={tx.tokens?.[1]?.token_name}
                        className="w-[18px] h-[18px] inline-flex items-center"
                      />
                      <span className="font-mono text-sm text-white">
                        {formatCurrency(
                          tx.tokens?.[1]?.amount || 0,
                          tx.tokens?.[1]?.decimal,
                          0,
                          4
                        )}{" "}
                        <span className="font-mono text-xs text-white/70">
                          {tx.tokens?.[1]?.token_symbol}
                        </span>
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono font-medium text-white px-2 flex pt-3.5 border-0"
                  )}
                >
                  {formatCurrency(tx.value, 0, 0, 2, "currency", "USD")}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-mono font-medium pr-4 pt-4 border-0"
                  )}
                >
                  <Button
                    variant="link"
                    size="sm"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTransaction(tx);
                    }}
                  >
                    <ExternalLink size={16} className="text-white/60" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow className="border-0">
              <TableCell
                colSpan={6}
                className="text-center py-8 text-white/60 border-0"
              >
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <CustomPagination
        itemsPerPage={ITEMS_PER_PAGE}
        totalItems={totalItems}
        currentPage={currentPage}
        handlePageChange={handlePageChange}
        displayTotalPages={displayTotalPages}
        isShowingTotalPages={true}
      />
    </DetailWrapper>
  );
};

export default VaultActivities;
