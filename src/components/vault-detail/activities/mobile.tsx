import { Fragment, useMemo, useState } from "react";
import {
  ExternalLink,
  Plus,
  ArrowUpRight,
  PauseCircle,
  Minus,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SwapIcon from "@/assets/icons/swap.svg";
import TableMobile, {
  RowTokens,
  RowType,
  RowTime,
  RowValue,
  RowAction,
  RowSkeleton,
} from "@/components/ui/table-mobile";
import { renamingType } from "@/components/vault-detail/activities/utils";
import { VaultActivityTransaction } from "@/types/vault";
import { useVaultMetricUnitStore } from "@/hooks";
import FormatUsdCollateralAmount from "../sections/format-usd-collateral-amount";
import { formatCollateralUsdNumber } from "../helpers";

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
        <img src={SwapIcon} alt="Swap" className="inline-block mr-1" />
      ),
    };
  }
  return {
    className: "bg-white/10 text-white/80",
    icon: null,
  };
};

const MobileReasoning = ({
  reasoning,
}: {
  reasoning: NonNullable<VaultActivityTransaction["reasoning"]>;
}) => (
  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 pl-5">
    <div className="absolute left-0 top-0 h-full w-1 bg-indigo-400/60" />
    <p className="text-white font-medium leading-6">{reasoning.what}</p>
    <p className="mt-1 text-white/80 leading-6">{reasoning.why}</p>
    <p className="mt-1 text-sm text-white/60">Next: {reasoning.next}</p>
  </div>
);

const MobileActivityRow = ({
  tx,
  onSelect,
  isUsd,
  unit,
}: {
  tx: VaultActivityTransaction;
  onSelect: (tx: VaultActivityTransaction) => void;
  isUsd: boolean;
  unit: string | undefined;
}) => {
  const [open, setOpen] = useState(false);
  const badge = badgeForType(tx.type);
  const explorerHash = tx.reasoning?.proof?.tx ?? tx.txhash;
  const explorerLabel = tx.reasoning?.proof?.label ?? "Explorer";
  const hasExplorer = Boolean(explorerHash);

  return (
    <div className="space-y-2">
      <RowType
        type={renamingType(tx.type)}
        icon={badge.icon}
        className={cn(
          "inline-block text-xs font-medium px-2 py-1 rounded-md",
          badge.className
        )}
      />
      {tx.tokens && tx.tokens.length > 0 ? (
        <RowTokens tokens={tx.tokens} />
      ) : (
        <RowValue label="Tokens" value="—" />
      )}
      <RowValue
        label="Value"
        value={
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
        }
      />
      <RowTime timestamp={tx.time} />
      <RowAction label="TXID">
        <button
          type="button"
          aria-label="Open in explorer"
          disabled={!hasExplorer}
          title={explorerLabel}
          onClick={(e) => {
            e.stopPropagation();
            if (!hasExplorer) {
              return;
            }
            onSelect({ ...tx, txhash: explorerHash });
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
      </RowAction>
      {tx.reasoning && (
        <RowAction label="Reason">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
            className="inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"
          >
            See why
            <ChevronRight
              className={cn(
                "w-3 h-3 transition-transform",
                open && "rotate-90"
              )}
            />
          </button>
        </RowAction>
      )}
      {open && tx.reasoning && (
        <MobileReasoning reasoning={tx.reasoning} />
      )}
      <hr className="bg-white/20 my-4" />
    </div>
  );
};

const MobileList = ({
  paginatedTransactions,
  isFetched,
  vault_id,
  handleSelectTransaction,
}: {
  paginatedTransactions: VaultActivityTransaction[];
  isFetched: boolean;
  vault_id: string;
  handleSelectTransaction: (transaction: VaultActivityTransaction) => void;
}) => {
  const { isUsd, unit } = useVaultMetricUnitStore(vault_id);
  const loadingRows = useMemo(() => Array.from({ length: 5 }), []);

  if (!isFetched) {
    return (
      <TableMobile>
        {loadingRows.map((_, i) => (
          <Fragment key={i}>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
            <hr className="bg-white/20 my-4" />
          </Fragment>
        ))}
      </TableMobile>
    );
  }

  return (
    <TableMobile>
      {paginatedTransactions.map((tx, index) => (
        <MobileActivityRow
          key={`transaction-${index}`}
          tx={tx}
          onSelect={handleSelectTransaction}
          isUsd={isUsd}
          unit={unit}
        />
      ))}
    </TableMobile>
  );
};

export default MobileList;
