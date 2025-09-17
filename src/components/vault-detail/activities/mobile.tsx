import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, ArrowUpRight } from "lucide-react";
import SwapIcon from "@/assets/icons/swap.svg";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import TableMobile, {
  RowTokens,
  RowType,
  RowTime,
  RowValue,
  RowAction,
  RowSkeleton,
} from "@/components/ui/table-mobile";
import {
  ADD_LIQUIDITY_TYPES,
  REMOVE_LIQUIDITY_TYPES,
} from "@/components/vault-detail/constant";
import { renamingType } from "@/components/vault-detail/activities/utils";
import ConditionRenderer from "@/components/shared/condition-renderer";
import ExternalIcon from "@/assets/icons/external-gradient.svg?react";
import { VaultActivityTransaction } from "@/types/vault";
import { useVaultMetricUnitStore } from "@/hooks";
import { formatNumber } from "@/lib/number";
import FormatUsdCollateralAmount from "../sections/format-usd-collateral-amount";
import { formatCollateralUsdNumber } from "../helpers";

const MobileList = ({
  paginatedTransactions,
  isFetched,
  vault_id,
  handleSelectTransaction,
}: {
  paginatedTransactions: VaultActivityTransaction[];
  isFetched: boolean;
  vault_id: string;
  handleSelectTransaction: (transaction: any) => void;
}) => {
  const { isUsd, unit } = useVaultMetricUnitStore(vault_id);

  return (
    <ConditionRenderer
      when={isFetched}
      fallback={
        <TableMobile>
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Fragment key={i}>
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <RowSkeleton />
                <hr className="bg-white/80 my-4" />
              </Fragment>
            ))}
        </TableMobile>
      }
    >
      <TableMobile>
        {paginatedTransactions.map((tx, index) => (
          <Fragment key={`transaction-${index}`}>
            <RowType
              type={renamingType(tx.type)}
              icon={
                ADD_LIQUIDITY_TYPES.includes(tx.type) ? (
                  <Plus size={16} className="inline-block mr-1" />
                ) : REMOVE_LIQUIDITY_TYPES.includes(tx.type) ? (
                  <ArrowUpRight size={16} className="inline-block mr-1" />
                ) : tx.type === "SWAP" ? (
                  <img
                    src={SwapIcon}
                    alt="Swap"
                    className="inline-block mr-1"
                  />
                ) : null
              }
              className={cn(
                "inline-block text-xs font-medium px-2 py-1 rounded-md",
                REMOVE_LIQUIDITY_TYPES.includes(tx.type) &&
                  "bg-[#F97316]/30 text-[#F97316]",
                ADD_LIQUIDITY_TYPES.includes(tx.type) &&
                  "bg-[#22C55E]/20 text-[#22C55E]",
                tx.type === "SWAP" && "bg-[#3B82F6]/30 text-[#3B82F6]"
              )}
            />
            <RowTokens tokens={tx.tokens} />
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
                  })}
                />
              }
            />
            <RowTime timestamp={tx.time} />
            <RowAction label="Tx Hash">
              <Button
                variant="link"
                size="sm"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTransaction(tx);
                }}
              >
                <ExternalIcon />
              </Button>
            </RowAction>
            <hr className="bg-white/80 my-4" />
          </Fragment>
        ))}
      </TableMobile>
    </ConditionRenderer>
  );
};

export default MobileList;
