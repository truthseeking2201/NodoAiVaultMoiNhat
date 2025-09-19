import { VaultHoldingType } from "@/types/vault-config.types";
import { useVaultMetricUnitStore } from "@/hooks";
import { WrapCard } from "./wrap-card";
import { FormatNumberByMetrics } from "./format-number-by-metrics";
import { ReactNode } from "react";

const Card = ({ children, title }: { children: ReactNode; title: string }) => {
  return (
    <div className="px-3 py-2 bg-white/8 rounded-md flex sm:items-center justify-between max-sm:flex-col gap-1">
      <div className="font-sans text-sm text-white/70 ">{title}</div>
      {children}
    </div>
  );
};

export const Cashflow = ({ data }: { data: VaultHoldingType }) => {
  const { unit, key } = useVaultMetricUnitStore(data?.vault_id);

  const valueClass = "font-mono text-white text-sm";
  const collateralClass = "w-4 h-4";

  return (
    <WrapCard className="md:p-5 px-4 py-3">
      <div className="font-sans text-sm md:text-lg text-white/90 font-bold md:mb-4 mb-2">
        Cashflow
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Total Deposits">
          <FormatNumberByMetrics
            unit={unit}
            number={data?.[`user_total_deposit_${key}`] || 0}
            className={valueClass}
            collateralClassName={collateralClass}
          />
        </Card>
        <Card title="Total Withdrawals">
          <FormatNumberByMetrics
            unit={unit}
            number={data?.[`user_total_withdraw_${key}`] || 0}
            className={valueClass}
            collateralClassName={collateralClass}
          />
        </Card>
      </div>
    </WrapCard>
  );
};
