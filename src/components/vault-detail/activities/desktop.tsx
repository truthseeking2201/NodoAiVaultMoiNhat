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
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import {
  ITEMS_PER_PAGE,
  ADD_LIQUIDITY_TYPES,
  REMOVE_LIQUIDITY_TYPES,
} from "@/components/vault-detail/constant";
import {
  formatTime,
  renamingType,
} from "@/components/vault-detail/activities/utils";

const DesktopTable = ({
  paginatedTransactions,
  isFetching,
  isFetched,
  handleSelectTransaction,
}) => {
  return (
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
                {tx.tokens?.[1] && tx.tokens?.[1]?.token_name && (
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
  );
};

export default DesktopTable;
