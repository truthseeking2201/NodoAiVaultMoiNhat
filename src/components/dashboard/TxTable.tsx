import { useState } from "react";
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

interface TxTableProps {
  transactions?: TransactionHistory;
  isLoading?: boolean;
  onSelect: (tx: Transaction) => void;
  onChangePage?: (page: number) => void;
  onChangeFilter?: (filter: Types["type"][]) => void;
}

export function TxTable({
  transactions,
  isLoading = false,
  onSelect,
  onChangePage,
  onChangeFilter,
}: TxTableProps) {
  const [filter, setFilter] = useState<Types["type"][]>(["ALL"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const listItems = (transactions?.list ?? []) as Transaction[];

  const filteredTransactions = filter.includes("ALL")
    ? listItems
    : listItems.filter((tx) => filter.includes(tx.type));

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / itemsPerPage)
  );

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (onChangePage) {
        onChangePage(page);
      }
    }
  };

  const handleFilterChange = (newFilter: Types["type"][]) => {
    if (
      onChangeFilter &&
      (newFilter.length !== filter.length ||
        !newFilter.every((f, i) => f === filter[i]))
    ) {
      setCurrentPage(1);
      setFilter(newFilter);
      onChangeFilter(newFilter);
    }
  };

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
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
    // Mock hash for demo purposes
    const mockHash = "0x7d83c975da6e3b5ff8259436d4f7da6d75";
    return `${mockHash.slice(0, 6)}...${mockHash.slice(-4)}`;
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash).then(() => {
      // In a real app, you'd show a toast notification
      console.log("Hash copied to clipboard");
    });
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

      <div className="glass-card overflow-hidden w-[734px]">
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
              {isLoading ? (
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
              ) : paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx, index) => (
                  <TableRow
                    key={`transaction-${index}`}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer even:bg-white/[0.02]"
                    onClick={() => onSelect(tx)}
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
                    <TableCell
                      className="font-mono text-xs text-white/70 flex items-center px-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyHash(tx.txhash);
                      }}
                    >
                      <span className="hover:text-white transition-colors mt-1">
                        {shortenHash(tx.txhash)}
                      </span>
                    </TableCell>
                    <TableCell className="px-2">
                      <div className="flex items-center justify-start gap-1">
                        <img
                          src={tokenImgs[tx.tokens?.token_a?.name]}
                          alt={tx.tokens?.token_a?.name}
                          className="w-4 h-4"
                        />
                        <div className="font-mono text-sm text-white">
                          {formatCurrency(tx.tokens?.token_a?.amount)}{" "}
                        </div>
                        <div className="font-mono text-xs text-white/70">
                          {tx.tokens?.token_a?.name}
                        </div>
                      </div>
                      <div className="flex items-center justify-start gap-1 mt-1">
                        <img
                          src={tokenImgs[tx.tokens?.token_b?.name]}
                          alt={tx.tokens?.token_b?.name}
                          className="w-4 h-4"
                        />
                        <div className="font-mono text-sm text-white">
                          {formatCurrency(tx.tokens?.token_b?.amount)}{" "}
                        </div>
                        <div className="font-mono text-xs text-white/70">
                          {tx.tokens?.token_b?.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-medium text-white px-2 flex">
                      {formatCurrency(
                        Number(tx.tokens?.token_a?.amount || 0) +
                          Number(tx.tokens?.token_b?.amount || 0)
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <Button
                        variant="link"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://explorer.sui.io/txblock/${tx.txhash}`,
                            "_blank"
                          );
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
          {Math.min(itemsPerPage * currentPage, filteredTransactions.length)} of{" "}
          {filteredTransactions.length} activities
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
            {totalPages === 0 ? (
              <Button
                key={1}
                onClick={() => handlePageChange(1)}
                variant="primary"
                size="pagination"
              >
                1
              </Button>
            ) : totalPages <= 5 ? (
              Array.from({ length: totalPages }, (_, i) => (
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
                    {[1, 2, 3, 4, 5].map((page) => (
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
                ) : currentPage >= totalPages - 2 ? (
                  <>
                    <span className="px-2 text-white/60 select-none">...</span>
                    {[
                      totalPages - 4,
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                      totalPages,
                    ].map((page) => (
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
                    {[currentPage - 1, currentPage, currentPage + 1].map(
                      (page) => (
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
                      )
                    )}
                    <span className="px-2 text-white/60 select-none">...</span>
                  </>
                )}
              </>
            )}
          </div>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            variant="pagination-default"
            size="pagination"
          >
            <ChevronRight size={12} />
          </Button>
          <Button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
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
