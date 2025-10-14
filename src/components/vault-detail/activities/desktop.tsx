import { Fragment, useMemo, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  ExternalLink,
  Plus,
  ArrowUpRight,
  PauseCircle,
  Minus,
  ChevronRight,
} from "lucide-react";
import SwapIcon from "@/assets/icons/swap.svg";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { ITEMS_PER_PAGE } from "@/components/vault-detail/constant";
import {
  formatTime,
  renamingType,
} from "@/components/vault-detail/activities/utils";
import FormatUsdCollateralAmount from "../sections/format-usd-collateral-amount";
import { useVaultMetricUnitStore } from "@/hooks";
import { VaultActivityTransaction } from "@/types/vault";
import { formatCollateralUsdNumber } from "../helpers";

const ReasoningPanel = ({
  reasoning,
}: {
  reasoning: NonNullable<VaultActivityTransaction["reasoning"]>;
}) => (
  <div className="ml-8 mr-5 mb-4">
    <div className="relative rounded-xl border border-white/10 bg-white/5 p-4 pl-5">
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-indigo-400/60" />
      <p className="text-white font-medium leading-6">{reasoning.what}</p>
      <p className="mt-1 text-white/80 leading-6">{reasoning.why}</p>
      <p className="mt-1 text-sm text-white/60">Next: {reasoning.next}</p>
    </div>
  </div>
);

const badgeForType = (type: string) => {
  if (["ADD", "ADD_LIQUIDITY", "OPEN", "COMPOUND"].includes(type)) {
    return {
      className: "bg-[#22C55E]/20 text-[#22C55E]",
      icon: <Plus size={16} className="inline-block mr-1" />,
    };
  }
  if (["WITHDRAW", "REMOVE_LIQUIDITY", "CLOSE_REOPEN"].includes(type)) {
    return {
      className: "bg-[#F97316]/30 text-[#F97316]",
      icon: <ArrowUpRight size={16} className="inline-block mr-1" />,
    };
  }
  if (type === "PAUSE") {
    return {
      className: "bg-[#3B82F6]/20 text-[#3B82F6]",
      icon: <PauseCircle size={16} className="inline-block mr-1" />,
    };
  }
  if (type === "HOLD") {
    return {
      className: "bg-white/10 text-white/80",
      icon: <Minus size={16} className="inline-block mr-1" />,
    };
  }
  if (type === "SWAP") {
    return {
      className: "bg-[#3B82F6]/30 text-[#3B82F6]",
      icon: (
        <img
          src={SwapIcon}
          alt="Swap"
          className="inline-block mr-1"
        />
      ),
    };
  }
  return {
    className: "bg-white/10 text-white/80",
    icon: null,
  };
};

const DesktopTable = ({
  paginatedTransactions,
  isFetching,
  isFetched,
  handleSelectTransaction,
  vault_id,
}: {
  paginatedTransactions: VaultActivityTransaction[];
  isFetching: boolean;
  isFetched: boolean;
  handleSelectTransaction: (tx: VaultActivityTransaction) => void;
  vault_id: string;
}) => {
  const { isUsd, unit } = useVaultMetricUnitStore(vault_id);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadingRows = useMemo(() => Array.from({ length: ITEMS_PER_PAGE }), []);

  return (
    <Table className="w-full border-0">
      <TableHeader className="border-b border-white/20">
        <TableRow className="border-b-0 border-white/10 hover:bg-transparent">
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[160px] px-5">
            Type
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[110px] px-5">
            Time
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[160px] px-5">
            Tokens
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[120px] px-5">
            Value
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[90px] px-5 text-center">
            TXID
          </TableHead>
          <TableHead className="text-xs uppercase tracking-wide text-white/70 w-[140px] px-5 text-right">
            Reason
          </TableHead>
        </TableRow>
      </TableHeader>
      <div className="mt-4" />
      <TableBody>
        {isFetching ? (
          loadingRows.map((_, i) => (
            <TableRow
              key={`skeleton-${i}`}
              className={cn("hover:bg-white/5 w-full h-[70px] border-0")}
            >
              {Array.from({ length: 6 }).map((__, col) => (
                <TableCell key={col} className={cn("px-5 pt-3 border-0")}>
                  <div className="h-5 bg-white/10 animate-pulse rounded mt-3" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : isFetched && paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((tx, index) => {
            const isExpanded = !!expanded[tx.id];
            const badge = badgeForType(tx.type);
            const primaryToken = tx.tokens?.[0];
            const secondaryToken = tx.tokens?.[1];
            const explorerHash = tx.reasoning?.proof?.tx ?? tx.txhash;
            const hasExplorer = Boolean(explorerHash);

            return (
              <Fragment key={`transaction-${index}`}>
                <TableRow
                  className={cn(
                    "hover:bg-[#FFFFFF14] h-[70px] border-0",
                    isExpanded && "bg-[#FFFFFF0D]"
                  )}
                >
                  <TableCell className="px-5 pt-3 border-0">
                    <span
                      className={cn(
                        "inline-flex items-center text-xs font-medium px-2 py-1 rounded-md",
                        badge.className
                      )}
                    >
                      {badge.icon}
                      {renamingType(tx.type)}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono text-xs text-white/70 px-5 pt-2 border-0"
                    )}
                  >
                    {formatTime(tx.time)}
                  </TableCell>

                  <TableCell className="px-5 border-0">
                    {primaryToken ? (
                      <div className="flex items-center justify-start gap-1">
                        <img
                          src={`/coins/${primaryToken.token_symbol?.toLowerCase()}.png`}
                          alt={primaryToken.token_name}
                          className="w-[18px] h-[18px] inline-flex items-center"
                        />
                        <span className="font-mono text-sm text-white">
                          {formatCurrency(
                            primaryToken.amount || 0,
                            primaryToken.decimal ?? 0,
                            0,
                            4
                          )}{" "}
                          <span className="font-mono text-xs text-white/70">
                            {primaryToken.token_symbol}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-white/60">—</span>
                    )}
                    {primaryToken && secondaryToken?.token_name && (
                      <div className="flex items-center justify-start gap-1 mt-1">
                        <img
                          src={`/coins/${secondaryToken.token_symbol?.toLowerCase()}.png`}
                          alt={secondaryToken.token_name}
                          className="w-[18px] h-[18px] inline-flex items-center"
                        />
                        <span className="font-mono text-sm text-white">
                          {formatCurrency(
                            secondaryToken.amount || 0,
                            secondaryToken.decimal ?? 0,
                            0,
                            4
                          )}{" "}
                          <span className="font-mono text-xs text-white/70">
                            {secondaryToken.token_symbol}
                          </span>
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono font-medium text-white px-5 flex pt-3.5 border-0"
                    )}
                  >
                    <FormatUsdCollateralAmount
                      collateralIcon={unit}
                      collateralClassName="w-4 h-4"
                      text={formatCollateralUsdNumber({
                        value_usd: tx.value_usd,
                        value_collateral: tx.value_collateral,
                        isUsd,
                        unit,
                      })}
                    />
                  </TableCell>
                  <TableCell className="px-5 border-0 pt-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        aria-label="Open in explorer"
                        disabled={!hasExplorer}
                        onClick={(event) => {
                          event.stopPropagation();
                          if (!hasExplorer) {
                            return;
                          }
                          handleSelectTransaction({
                            ...tx,
                            txhash: explorerHash,
                          });
                        }}
                        className={cn(
                          "inline-grid h-8 w-8 place-items-center rounded-md border border-white/10 transition-colors",
                          hasExplorer
                            ? "text-white/80 hover:bg-white/10"
                            : "cursor-not-allowed text-white/30"
                        )}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 pt-3 border-0 text-right">
                    {tx.reasoning && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(tx.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"
                      >
                        See why
                        <ChevronRight
                          className={cn(
                            "w-3 h-3 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
                {isExpanded && tx.reasoning && (
                  <TableRow className="border-0 bg-[#0F1115]">
                    <TableCell colSpan={6} className="border-0 px-5 pb-5">
                      <ReasoningPanel reasoning={tx.reasoning} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })
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
