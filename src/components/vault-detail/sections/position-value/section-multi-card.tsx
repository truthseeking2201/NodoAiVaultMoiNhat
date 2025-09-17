import { VaultHoldingType } from "@/types/vault-config.types";
import { WrapCard } from "./wrap-card";
import { FormatNumberByMetrics } from "./format-number-by-metrics";
import { useMemo, ReactNode } from "react";
import { showFormatNumberOption } from "@/lib/number";

const Card = ({
  children,
  title,
  rightMobile,
}: {
  children: ReactNode;
  title: string;
  rightMobile?: ReactNode;
}) => {
  return (
    <WrapCard className="px-4 py-3">
      <div className="flex items-center justify-between mb-1">
        <div className="font-sans text-xs text-white/60 uppercase ">
          {title}
        </div>
        {rightMobile && <div className="block md:hidden">{rightMobile}</div>}
      </div>
      {children}
      {rightMobile && <div className="hidden md:block mt-1">{rightMobile}</div>}
    </WrapCard>
  );
};

export const SectionMultiCard = ({
  data,
  unitMetric,
  keyMetric,
  lpSymbol,
}: {
  data: VaultHoldingType;
  unitMetric: string;
  keyMetric: string;
  lpSymbol: string;
}) => {
  const reward24h = useMemo(() => {
    return data?.[`user_rewards_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const breakEvent = useMemo(() => {
    return data?.[`user_break_event_price_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const lpPrice = useMemo(() => {
    return data?.[`ndlp_price_${keyMetric}`] || 0;
  }, [data, keyMetric]);

  const sharesPercent = useMemo(() => {
    return Number(data?.user_shares_percent || 0) * 100;
  }, [data]);

  const userLp = useMemo(() => {
    // TODO
    return 4652;
  }, [data]);

  const totalLp = useMemo(() => {
    // TODO
    return 1000000;
  }, [data]);

  const valueClass = "font-mono text-white text-lg md:text-xl font-medium";
  const collateralClass = "w-4 h-4";

  return (
    <section className="grid md:grid-cols-3 grid-cols-1 gap-4">
      <Card
        title="24h rewards"
        rightMobile={
          <p className="text-xs text-white/60 m-0">Updates every 1h</p>
        }
      >
        {reward24h > 0 ? (
          <FormatNumberByMetrics
            unit={unitMetric}
            number={reward24h}
            className={valueClass}
            collateralClassName={collateralClass}
          />
        ) : (
          <span className="text-[#00FFB2]">
            <span className="text-lg md:text-xl">Farming</span>
            <span className="animate-fade-in-out inline-block delay-100">
              .
            </span>
            <span className="animate-fade-in-out inline-block delay-200">
              .
            </span>
            <span className="animate-fade-in-out inline-block delay-300">
              .
            </span>
          </span>
        )}
      </Card>
      <Card
        title="Break-even"
        rightMobile={
          <div className="text-xs text-white/60 ">
            {`Current ${lpSymbol} price: `}
            <FormatNumberByMetrics
              unit={unitMetric}
              number={lpPrice}
              className="text-white"
              showUnit
              minPrecision={4}
            />
          </div>
        }
      >
        <FormatNumberByMetrics
          unit={unitMetric}
          number={breakEvent}
          className={valueClass}
          collateralClassName={collateralClass}
        />
      </Card>
      <Card title="Your Share">
        <div className={valueClass}>
          {showFormatNumberOption(sharesPercent)}%
        </div>
        <div className="text-xs mt-1 text-white">
          <span className="text-white/60">≈</span>{" "}
          {showFormatNumberOption(userLp)} / {showFormatNumberOption(totalLp)}
          <span className="text-white/60"> {lpSymbol}</span>
        </div>
      </Card>
    </section>
  );
};
