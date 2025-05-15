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
import {
  ChevronLast,
  ChevronFirst,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import SwapIcon from "@/assets/icons/swap.svg";
import USDCIcon from "@/assets/images/usdc.png";
import SUIIcon from "@/assets/images/sui-wallet.png";
import CetusIcon from "@/assets/images/cetus.png";
import { getVaultsActivities } from "@/apis/vault";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { formatDate12Hours } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { truncateBetween } from "@/utils/truncate";

export function TxTable() {
  const [filter, setFilter] = useState<Types["type"][]>(["ALL"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastTotalPages, setLastTotalPages] = useState(1);

  const itemsPerPage = 5;
  const ADD_LIQUIDITY_TYPES = [
    "ADD_LIQUIDITY",
    "OPEN",
    "ADD_PROFIT_UPDATE_RATE",
    "CLAIM_REWARDS",
  ];

  const REMOVE_LIQUIDITY_TYPES = ["REMOVE_LIQUIDITY", "CLOSE"];
  const SWAP_TYPES = ["SWAP"];

  const fetchVaultActivities = async ({
    page = 1,
    limit = 5,
    action_type = "",
  }: {
    page?: number;
    limit?: number;
    action_type?: string;
  }): Promise<TransactionHistory> => {
    try {
      const response = await getVaultsActivities({
        page,
        limit,
        action_type,
      });

      if (response) {
        return response as TransactionHistory;
      }
    } catch (error) {
      console.error("Error fetching vault activities:", error);
    }
    return { list: [], total: 0, page: 1 } as TransactionHistory;
  };
  const handleFormatFilter = (filter: Types["type"][]) => {
    if (filter.includes("ALL")) {
      return "";
    }
    if (filter.includes("SWAP")) {
      return "SWAP";
    }
    if (
      ADD_LIQUIDITY_TYPES.some((type) => filter.includes(type as Types["type"]))
    ) {
      return "ADD_LIQUIDITY";
    }
    if (
      REMOVE_LIQUIDITY_TYPES.some((type) =>
        filter.includes(type as Types["type"])
      )
    ) {
      return "REMOVE_LIQUIDITY";
    }
  };

  const { data, isFetching, isFetched } = useQuery({
    queryKey: ["activities", currentPage, filter],
    queryFn: () =>
      fetchVaultActivities({
        page: currentPage,
        limit: itemsPerPage,
        action_type: handleFormatFilter(filter),
      }),
    staleTime: 30000,
  });

  const listItems = data?.list ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    if (!isFetching && totalPages !== lastTotalPages) {
      setLastTotalPages(totalPages);
    }
  }, [isFetching, totalPages]);

  const displayTotalPages = isFetching ? lastTotalPages : totalPages;
  const paginatedTransactions = listItems;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (newFilter: Types["type"][]) => {
    if (
      newFilter.length !== filter.length ||
      !newFilter.every((f, i) => f === filter[i])
    ) {
      setCurrentPage(1);
      setFilter(newFilter);
      fetchVaultActivities({
        page: 1,
        limit: itemsPerPage,
        action_type: handleFormatFilter(newFilter),
      });
    }
  };

  const directToTx = (txhash: string) => {
    window.open(`https://suiscan.xyz/mainnet/tx/${txhash}`, "_blank");
  };

  const handleSelectTransaction = (transaction: Transaction) => {
    directToTx(transaction.txhash);
  };

  type DirectToAddressEvent = React.MouseEvent<HTMLSpanElement, MouseEvent>;
  const directToAddress = (e: DirectToAddressEvent, address: string): void => {
    e.stopPropagation();
    window.open(
      `https://suiscan.xyz/mainnet/object/${address}/tx-blocks`,
      "_blank"
    );
  };

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

  const tokenImgs = {
    USDC: USDCIcon,
    SUI: SUIIcon,
    CETUS: CetusIcon,
  };

  return (
    <div className="space-y-4 mt-[64px]">
      <div className="flex flex-wrap gap-2 md:justify-between">
        <h2 className="font-heading-lg text-100 mb-4">Vault Activities</h2>
        <div className="flex space-x-2">
          <Button
            variant={filter.includes("ALL") ? "primary" : "pagination-default"}
            size="sm"
            onClick={() => handleFilterChange(["ALL"])}
          >
            All
          </Button>
          <Button
            variant={filter.includes("SWAP") ? "primary" : "pagination-default"}
            size="sm"
            onClick={() => handleFilterChange(SWAP_TYPES as Types["type"][])}
          >
            Swap
          </Button>
          <Button
            variant={
              ADD_LIQUIDITY_TYPES.some((type) =>
                filter.includes(type as Types["type"])
              )
                ? "primary"
                : "pagination-default"
            }
            size="sm"
            onClick={() =>
              handleFilterChange(ADD_LIQUIDITY_TYPES as Types["type"][])
            }
          >
            Add Liquidity
          </Button>
          <Button
            variant={
              REMOVE_LIQUIDITY_TYPES.some((type) =>
                filter.includes(type as Types["type"])
              )
                ? "primary"
                : "pagination-default"
            }
            size="sm"
            onClick={() =>
              handleFilterChange(REMOVE_LIQUIDITY_TYPES as Types["type"][])
            }
          >
            Remove Liquidity
          </Button>
        </div>
      </div>

      <div className="glass-card overflow-hidden w-full">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[170px] ">
                  Type
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[88px] px-2">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[147px] px-2">
                  Vault address
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[136px] px-2">
                  Tokens
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[72px] px-2">
                  Value
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[90px] px-2">
                  Tx Hash
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                Array(itemsPerPage)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i} className="hover:bg-white/5 w-full">
                      <TableCell className="h-[74.6px]">
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell className="px-2">
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : isFetched && paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx, index) => (
                  <TableRow
                    key={`transaction-${index}`}
                    className="hover:bg-white/5 cursor-pointe"
                    onClick={() => handleSelectTransaction(tx)}
                  >
                    <TableCell>
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
                          <ArrowUpRight
                            size={16}
                            className="inline-block mr-1"
                          />
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
                    <TableCell className="font-mono text-xs text-white/70 px-2">
                      {formatDate12Hours(tx.time)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/70 flex items-center px-2">
                      <span
                        className="hover:text-white transition-colors mt-1 hover:cursor-pointer"
                        onClick={(e) => {
                          directToAddress(e, tx.vault_address);
                        }}
                      >
                        {truncateBetween(tx.vault_address, 4, 4)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2">
                      <div className="flex items-center justify-start gap-1">
                        <img
                          src={tokenImgs[tx.tokens?.[0]?.token_symbol]}
                          alt={tx.tokens?.[0]?.token_name}
                          className="w-4 h-4"
                        />
                        <div className="font-mono text-sm text-white">
                          {formatCurrency(
                            tx.tokens?.[0]?.amount || 0,
                            tx.tokens?.[0]?.decimal
                          )}{" "}
                        </div>
                        <div className="font-mono text-xs text-white/70">
                          {tx.tokens?.[0]?.token_symbol}
                        </div>
                      </div>
                      {tx.tokens?.[1]?.amount !== 0 && (
                        <div className="flex items-center justify-start gap-1 mt-1">
                          <img
                            src={tokenImgs[tx.tokens?.[1]?.token_symbol]}
                            alt={tx.tokens?.[1]?.token_name}
                            className="w-4 h-4"
                          />
                          <div className="font-mono text-sm text-white">
                            {formatCurrency(
                              tx.tokens?.[1]?.amount || 0,
                              tx.tokens?.[1]?.decimal
                            )}{" "}
                          </div>
                          <div className="font-mono text-xs text-white/70">
                            {tx.tokens?.[1]?.token_symbol}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-white px-2 flex">
                      {formatCurrency(tx.value, 0)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          directToTx(tx.txhash);
                        }}
                      >
                        <ExternalLink size={16} className="text-white/60" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-white/60"
                  >
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className=" text-white text-xs">
          Showing{" "}
          {Math.min(itemsPerPage * currentPage, paginatedTransactions.length)}-
          {itemsPerPage * (currentPage - 1) + 1} of{" "}
          {paginatedTransactions.length} activities
        </div>
        <div className="flex justify-end items-center mt-4 gap-2">
          <Button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            variant="pagination-default"
            size="pagination"
          >
            <ChevronFirst size={12} />
          </Button>
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="pagination-default"
            size="pagination"
          >
            <ChevronLeft size={12} />
          </Button>
          <div className="flex space-x-2">
            {displayTotalPages === 0 ? (
              <Button
                key={1}
                onClick={() => handlePageChange(1)}
                variant="primary"
                size="pagination"
              >
                1
              </Button>
            ) : displayTotalPages <= 5 ? (
              Array.from({ length: displayTotalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  variant={
                    currentPage === i + 1 ? "primary" : "pagination-default"
                  }
                  size="pagination"
                >
                  {i + 1}
                </Button>
              ))
            ) : (
              <>
                {currentPage <= 3 ? (
                  <>
                    {[1, 2, 3, 4, 5]
                      .filter((page) => page <= displayTotalPages)
                      .map((page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={
                            currentPage === page
                              ? "primary"
                              : "pagination-default"
                          }
                          size="pagination"
                        >
                          {page}
                        </Button>
                      ))}
                    {displayTotalPages > 5 && (
                      <span className="px-2 text-white/60 select-none">
                        ...
                      </span>
                    )}
                  </>
                ) : currentPage >= displayTotalPages - 2 ? (
                  <>
                    <span className="px-2 text-white/60 select-none">...</span>
                    {Array.from(
                      { length: 5 },
                      (_, i) => displayTotalPages - 4 + i
                    )
                      .filter((page) => page >= 1 && page <= displayTotalPages)
                      .map((page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={
                            currentPage === page
                              ? "primary"
                              : "pagination-default"
                          }
                          size="pagination"
                        >
                          {page}
                        </Button>
                      ))}
                  </>
                ) : (
                  <>
                    <span className="px-2 text-white/60 select-none">...</span>
                    {[currentPage - 1, currentPage, currentPage + 1]
                      .filter((page) => page >= 1 && page <= displayTotalPages)
                      .map((page) => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={
                            currentPage === page
                              ? "primary"
                              : "pagination-default"
                          }
                          size="pagination"
                        >
                          {page}
                        </Button>
                      ))}
                    <span className="px-2 text-white/60 select-none">...</span>
                  </>
                )}
              </>
            )}
          </div>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === displayTotalPages}
            variant="pagination-default"
            size="pagination"
          >
            <ChevronRight size={12} />
          </Button>
          <Button
            onClick={() => handlePageChange(displayTotalPages)}
            disabled={currentPage === displayTotalPages}
            variant="pagination-default"
            size="pagination"
          >
            <ChevronLast size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
