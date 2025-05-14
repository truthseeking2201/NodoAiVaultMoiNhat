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
import { getVaultsActivities } from "@/apis/vault";
import { useQuery } from "@tanstack/react-query";

export function TxTable() {
  const [filter, setFilter] = useState<Types["type"][]>(["ALL"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
      ["ADD_LIQUIDITY", "OPEN", "ADD_PROFIT_UPDATE_RATE", "CLAIM_REWARDS"].some(
        (type) => filter.includes(type as Types["type"])
      )
    ) {
      return "ADD_LIQUIDITY";
    }
    if (
      ["REMOVE_LIQUIDITY", "CLOSE"].some((type) =>
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
  console.log("🚀 ~ TxTable ~ data:", data)

  const listItems = data?.list ?? [];
  const totalItems = data?.total ?? 0;

  const [lastTotalPages, setLastTotalPages] = useState(1);
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

  const formatCurrency = (value: number | string, decimal: number | string) => {
    const decimalNum = Number(decimal ?? 0);
    const currencyValue = Number(value) / Math.pow(10, decimalNum);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(currencyValue);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = String(date.getFullYear());
    let hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;
    return `${month}/${day}/${year} ${hour}:${minute} ${ampm}`;
  };

  const shortenHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
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
  };

  return (
    <div className="space-y-4">
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
            onClick={() => handleFilterChange(["SWAP"])}
          >
            Swap
          </Button>
          <Button
            variant={
              [
                "ADD_LIQUIDITY",
                "OPEN",
                "ADD_PROFIT_UPDATE_RATE",
                "CLAIM_REWARDS",
              ].some((type) => filter.includes(type as Types["type"]))
                ? "primary"
                : "pagination-default"
            }
            size="sm"
            onClick={() =>
              handleFilterChange([
                "ADD_LIQUIDITY",
                "OPEN",
                "ADD_PROFIT_UPDATE_RATE",
                "CLAIM_REWARDS",
              ])
            }
          >
            Add Liquidity
          </Button>
          <Button
            variant={
              ["REMOVE_LIQUIDITY", "CLOSE"].some((type) =>
                filter.includes(type as Types["type"])
              )
                ? "primary"
                : "pagination-default"
            }
            size="sm"
            onClick={() => handleFilterChange(["REMOVE_LIQUIDITY", "CLOSE"])}
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
                <TableHead className="text-xs uppercase tracking-wide text-white/60 w-[80px] px-2">
                  Date
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 px-2">
                  Vault address
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 px-2">
                  Tokens
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 px-2">
                  Value
                </TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-white/60 px-2">
                  Tx Hash
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isFetching ? (
                Array(itemsPerPage)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow
                      key={i}
                      className="border-b border-white/5 hover:bg-white/5 w-full"
                    >
                      <TableCell>
                        <div className="h-5 w-20 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-16 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-24 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 ml-auto bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-28 bg-white/10 animate-pulse rounded"></div>
                      </TableCell>
                    </TableRow>
                  ))
              ) : isFetched && paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx, index) => (
                  <TableRow
                    key={`transaction-${index}`}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer even:bg-white/[0.02]"
                    onClick={() => handleSelectTransaction(tx)}
                  >
                    <TableCell>
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-md ${
                          ["REMOVE_LIQUIDITY", "CLOSE"].includes(tx.type) &&
                          "bg-[#F97316]/30 text-[#F97316]"
                        } ${
                          [
                            "ADD_LIQUIDITY",
                            "OPEN",
                            "ADD_PROFIT_UPDATE_RATE",
                            "CLAIM_REWARDS",
                          ].includes(tx.type) &&
                          "bg-[#22C55E]/20 text-[#22C55E]"
                        } ${
                          tx.type === "SWAP" && "bg-[#3B82F6]/30 text-[#3B82F6]"
                        }
                        `}
                      >
                        {[
                          "ADD_LIQUIDITY",
                          "OPEN",
                          "ADD_PROFIT_UPDATE_RATE",
                          "CLAIM_REWARDS",
                        ].includes(tx.type) && (
                          <Plus size={16} className="inline-block mr-1" />
                        )}
                        {["REMOVE_LIQUIDITY", "CLOSE"].includes(tx.type) && (
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
                      {formatDate(tx.time)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-white/70 flex items-center px-2">
                      <span className="hover:text-white transition-colors mt-1">
                        {shortenHash(tx.vault_address)}
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
          Showing {itemsPerPage * (currentPage - 1) + 1}-
          {Math.min(itemsPerPage * currentPage, paginatedTransactions.length)}{" "}
          of {paginatedTransactions.length} activities
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
