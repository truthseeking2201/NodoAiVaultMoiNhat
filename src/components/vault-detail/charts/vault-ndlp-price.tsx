import { Fragment, useMemo, FC } from "react";
import {
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ChartDataPoint, PERIOD_TABS, VaultChartDataPoint } from "../constant";
import useBreakpoint from "@/hooks/use-breakpoint";
import { CustomTooltipProps } from "./type";
import PriceChange from "@/components/shared/price-change";
import { formatDate } from "@/utils/date";
import { formatNumber } from "@/lib/number";
import { useVaultMetricUnitStore } from "@/hooks";
import FormatUsdCollateralAmount from "../sections/format-usd-collateral-amount";
import { useParams } from "react-router-dom";
import ChartNoData from "./empty-data";
import { Skeleton } from "@/components/ui/skeleton";
import ConditionRenderer from "@/components/shared/condition-renderer";

const CustomLegend = () => {
  const { isMobile } = useBreakpoint();
  return (
    <div className="flex gap-4 justify-evenly mt-4">
      <div className="flex items-center gap-2">
        <span
          style={{
            display: "inline-block",
            width: isMobile ? 50 : 100,
            height: 3,
            background:
              "linear-gradient(90deg, #F2BB89 0%, #F3D2B5 50.48%, #F5C8A4 100%)",
            borderRadius: 1,
          }}
        />
        <span className="md:text-sm text-[10px] text-white font-medium">
          Vault's NDLP Price
        </span>
      </div>
    </div>
  );
};

const CustomTick: FC<{
  x?: number;
  y?: number;
  payload?: { value: number };
}> = ({ x, y, payload }) => {
  const { vault_id } = useParams();
  const { unit } = useVaultMetricUnitStore(vault_id);

  if (!payload || x === undefined || y === undefined) return null;

  const value = payload.value;
  let decimalPlaces = 2;
  if (Math.abs(value) < 0.001) {
    decimalPlaces = 8;
  } else if (Math.abs(value) < 0.01) {
    decimalPlaces = 6;
  } else if (Math.abs(value) < 0.1) {
    decimalPlaces = 4;
  } else if (Math.abs(value) < 1) {
    decimalPlaces = 3;
  }

  return (
    <foreignObject x={10} y={y - 8} width={50} height={16}>
      <div className="flex items-center justify-start h-full">
        <FormatUsdCollateralAmount
          collateralIcon={unit}
          className="font-mono text-xs text-white"
          collateralClassName="w-3 h-3"
          text={formatNumber(value, 0, decimalPlaces)}
        />
      </div>
    </foreignObject>
  );
};

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  const { vault_id } = useParams();
  const { unit, isUsd } = useVaultMetricUnitStore(vault_id);
  if (!active || !payload || !payload.length) return null;

  const priceData = payload[0]?.payload;

  if (!priceData) return null;

  const ndlpPrice = Number(priceData.ndlpRate);

  return (
    <div className="bg-black p-3 border border-white/20 rounded-lg shadow-lg w-[250px]">
      <div className="text-xs font-bold text-white mb-[6px]">
        {formatDate(label, "dd MMM yyyy HH:mm")}
      </div>
      {ndlpPrice && (
        <div className="flex items-end justify-between mb-1">
          <span className="font-medium text-xs text-white/80">
            NDLP Price:{" "}
          </span>
          <div className="flex items-center gap-1">
            <FormatUsdCollateralAmount
              collateralIcon={unit}
              className="font-mono text-sm font-semibold text-white"
              collateralClassName="w-4 h-4"
              text={formatNumber(ndlpPrice, 0, ndlpPrice < 1 ? 6 : 2)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface NdlpPriceChartProps {
  periodTab: string;
  ndlpPriceData?: any;
  isFetching: boolean;
  isFetched: boolean;
  isLoading: boolean;
}

const VaultNdlpPriceChart = ({
  periodTab,
  ndlpPriceData,
  isFetching,
  isFetched,
  isLoading,
}: NdlpPriceChartProps) => {
  const { isMobile } = useBreakpoint();
  const { vault_id } = useParams();
  const { isUsd, unit } = useVaultMetricUnitStore(vault_id);

  const isWeek = useMemo(() => {
    return periodTab === PERIOD_TABS[1].value;
  }, [periodTab]);

  const chartData: VaultChartDataPoint[] = useMemo(() => {
    if (!ndlpPriceData || isFetching) return [];

    const dataPoints = [];
    if (isFetched) {
      for (const item of ndlpPriceData) {
        dataPoints.push({
          time: item.timestamp,
          ndlpRate: isUsd ? item.ndlp_rate_usd : item.ndlp_rate,
        });
      }
    }

    return dataPoints;
  }, [ndlpPriceData, isFetching, isFetched, isUsd]);

  const lastItemIndex = chartData.length - 1;

  const yAxisRange = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [0, 100];
    }

    const rates = chartData
      .map((item) => item.ndlpRate)
      .filter((rate) => rate != null && !isNaN(rate));

    if (rates.length === 0) {
      return [0, 100];
    }

    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    // Add more padding to the range to ensure all reference lines are visible
    const padding = (maxRate - minRate) * 0.2 || 1; // Increased from 0.1 to 0.2 (20% padding)
    const paddedMin = Math.max(0, minRate - padding);
    const paddedMax = maxRate + padding;

    return [paddedMin, paddedMax];
  }, [chartData]);

  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisRange;
    const range = max - min;

    const tickCount = 6;
    const tickInterval = range / (tickCount - 1);

    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const tickValue = min + i * tickInterval;
      let decimalPlaces = 2;
      if (Math.abs(tickValue) < 0.001) {
        decimalPlaces = 8; // For very small values like 0.000857
      } else if (Math.abs(tickValue) < 0.01) {
        decimalPlaces = 6;
      } else if (Math.abs(tickValue) < 0.1) {
        decimalPlaces = 4;
      } else if (Math.abs(tickValue) < 1) {
        decimalPlaces = 3;
      }

      ticks.push(Number(tickValue.toFixed(decimalPlaces)));
    }

    return ticks;
  }, [yAxisRange]);

  if ((!chartData || chartData?.length === 0) && !isFetching) {
    return <ChartNoData type="ndlp-price" />;
  }

  return (
    <ConditionRenderer
      when={!isLoading}
      fallback={<Skeleton className="w-full h-[310px]" />}
    >
      <div className="flex flex-col gap-3 md:gap-6">
        <div
          className="w-full rounded-[10.742px] border-[0.671px] border-white/5 p-1"
          style={{
            background:
              "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 33%, rgba(251, 191, 36, 0.02) 33%, rgba(251, 191, 36, 0.05) 66%, rgba(239, 68, 68, 0.02) 66%, rgba(239, 68, 68, 0.05) 100%), #0A0A0A",
          }}
        >
          <ResponsiveContainer width="100%" height={isMobile ? 278 : 300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, left: 20, right: 20, bottom: 20 }}
              width={isMobile ? 364 : 500}
              height={isMobile ? 278 : 300}
            >
              {/* Horizontal reference lines for each Y-axis tick */}
              {yAxisTicks.map((tickValue, index) => (
                <ReferenceLine
                  key={`ref-line-${index}`}
                  y={tickValue}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeDasharray="2 2"
                  strokeWidth={2}
                />
              ))}
              <YAxis
                ticks={yAxisTicks}
                tick={<CustomTick />}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
              />
              <Legend content={<CustomLegend />} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="ndlpRate"
                stroke="#F3D2B5"
                strokeWidth={2}
                dot={({ cx, cy, index }) =>
                  index === lastItemIndex ? (
                    <Fragment key={index}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="white"
                        style={{ filter: "blur(4px)" }}
                        className="animate-pulse"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="black"
                        stroke="#fff"
                        strokeWidth={2.5}
                      />
                      <style>
                        {`
                    @keyframes fadeInDot {
                    from { opacity: 0; }
                    to { opacity: 1; }
                    }
                  `}
                      </style>
                    </Fragment>
                  ) : null
                }
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ConditionRenderer>
  );
};

export default VaultNdlpPriceChart;
