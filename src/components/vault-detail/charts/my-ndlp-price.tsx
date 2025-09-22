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
  Label,
} from "recharts";
import { ChartDataPoint, PERIOD_TABS } from "../constant";
import useBreakpoint from "@/hooks/use-breakpoint";
import { CustomTooltipProps } from "./type";
import PriceChange from "@/components/shared/price-change";
import { formatDate } from "@/utils/date";
import { formatNumber } from "@/lib/number";
import { useVaultMetricUnitStore } from "@/hooks";
import FormatUsdCollateralAmount from "../sections/format-usd-collateral-amount";
import { useParams } from "react-router-dom";
import ChartNoData from "./empty-data";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="flex items-center gap-2">
        <span
          style={{
            display: "inline-block",
            width: isMobile ? 19 : 38,
            height: isMobile ? 2 : 4,
            borderRadius: 1,
            borderTop: `${isMobile ? 1 : 2}px dashed rgba(253, 235, 207, 0.6)`,
            borderBottom: "none",
            borderLeft: "none",
            borderRight: "none",
          }}
        />
        <span className="md:text-sm text-[10px] text-white font-bold">
          Break-Even Price
        </span>
      </div>
    </div>
  );
};

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload }) => {
  const { vault_id } = useParams();
  const { unit } = useVaultMetricUnitStore(vault_id);
  if (!active || !payload || !payload.length) return null;

  const priceData = payload[0]?.payload;

  if (!priceData) return null;

  const ndlpPrice = Number(priceData.price);
  const breakEvenPrice = Number(priceData.breakEvenPrice) || 0;
  const percentage = Number(priceData.percentage) || 0;

  return (
    <div className="bg-black p-3 border border-white/20 rounded-lg shadow-lg w-[280px]">
      <div className="text-xs font-bold text-white mb-[6px]">
        {formatDate(priceData.time, "dd MMM yyyy HH:mm")}
      </div>
      <div className="flex items-end justify-between mb-1">
        <span className="font-medium text-xs text-white/80">NDLP Price: </span>
        <FormatUsdCollateralAmount
          collateralIcon={unit}
          className="font-mono text-sm font-semibold text-white"
          collateralClassName="w-4 h-4"
          text={formatNumber(ndlpPrice, 0, ndlpPrice < 1 ? 6 : 2)}
        />
      </div>
      <div className="flex items-end justify-between mb-1">
        <span className="font-medium text-xs text-white/80">
          Break Even Price:{" "}
        </span>
        <FormatUsdCollateralAmount
          collateralIcon={unit}
          className="font-mono text-sm font-semibold text-white"
          collateralClassName="w-4 h-4"
          text={formatNumber(breakEvenPrice, 0, breakEvenPrice < 1 ? 6 : 2)}
        />
      </div>
      <div className="flex items-end justify-between">
        <span className="font-medium text-xs text-white/80">
          Impermanent PnL:{" "}
        </span>
        <PriceChange
          priceChange={percentage}
          showParentheses={false}
          showPeriod={false}
          className="font-mono text-sm font-semibold"
        />
      </div>
      <div className="w-full h-[1px] bg-white/20 my-1.5" />
      <div className="text-[10px] font-medium text-white/70">
        Impermanent PnL equals the profit/ loss percentage based on the current
        NDLP Price divided by your Break-even Price
      </div>
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

const MyNdlpPriceChart = ({
  periodTab,
  ndlpPriceData,
  isFetching,
  isFetched,
  isLoading,
}: NdlpPriceChartProps) => {
  const { isMobile } = useBreakpoint();
  const { isUsd } = useVaultMetricUnitStore();

  const getZoneMessage = useMemo(
    () => (chartData: ChartDataPoint[]) => {
      const finalPercentage = chartData[chartData.length - 1]?.percentage || 0;

      if (finalPercentage === 0) return null;

      if (finalPercentage < -10) {
        return (
          <>
            Your position is in{" "}
            <span className="text-red-default font-medium">Risk Zone</span>.
            High liquidation risk - consider delaying withdrawal
          </>
        );
      } else if (finalPercentage >= -10 && finalPercentage < 0) {
        return (
          <>
            Your position is in{" "}
            <span className="text-yellow-warning font-medium">Wait Zone</span>.
            Consider waiting 1-3 days for price recovery
          </>
        );
      } else {
        return (
          <>
            Your position is in{" "}
            <span className="text-green-increase font-medium">Profit Zone</span>
            . Optimal withdrawal conditions
          </>
        );
      }
    },
    []
  );

  const isWeek = useMemo(() => {
    return periodTab === PERIOD_TABS[1].value;
  }, [periodTab]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!ndlpPriceData || isFetching) return [];

    const dataPoints = [];
    if (isFetched) {
      for (const item of ndlpPriceData) {
        dataPoints.push({
          time: item.timestamp,
          price: isUsd ? item.ndlp_price_usd : item.ndlp_price,
          breakEvenPrice: isUsd
            ? item.user_break_event_price_usd
            : item.user_break_event_price,
          percentage: item.performance_percent,
        });
      }
    }

    return dataPoints;
  }, [ndlpPriceData, isFetching, isFetched, isUsd]);

  const lastItemIndex = chartData.length - 1;

  const interval = useMemo(
    () => (isWeek ? (isMobile ? 20 : 35) : 3),
    [isWeek, isMobile]
  );

  const yAxisRange = useMemo(() => {
    if (!chartData.length) return [-15, 15];

    const percentages = chartData.map((item) => item.percentage);
    const minPercentage = Math.min(...percentages);
    const maxPercentage = Math.max(...percentages);

    // Calculate dynamic range with padding
    const range = maxPercentage - minPercentage;
    const padding = Math.max(range * 0.1, 5); // At least 5% padding

    let min = Math.floor(minPercentage - padding);
    let max = Math.ceil(maxPercentage + padding);

    // Always ensure 0% is included in the range
    if (min > 0) {
      min = 0; // If all data is positive, start from 0%
    }
    if (max < 0) {
      max = 0; // If all data is negative, end at 0%
    }

    // Ensure we have reasonable bounds
    const finalMin = Math.max(min, -100);
    const finalMax = Math.min(max, 100);

    return [finalMin, finalMax];
  }, [chartData]);

  const yAxisTicks = useMemo(() => {
    const [min, max] = yAxisRange;
    const range = max - min;

    let tickInterval;
    if (range <= 30) tickInterval = 5;
    else if (range <= 60) tickInterval = 10;
    else if (range <= 120) tickInterval = 20;
    else tickInterval = 50;

    const ticks = [];
    for (let i = min; i <= max; i += tickInterval) {
      ticks.push(i);
    }

    // Always include 0% as baseline if it's within the range and not already included
    if (min <= 0 && max >= 0 && !ticks.includes(0)) {
      ticks.push(0);
    }

    // Sort ticks to maintain order
    const sortedTicks = ticks.sort((a, b) => a - b);
    return sortedTicks;
  }, [yAxisRange]);

  const referenceAreaBounds = useMemo(() => {
    const [yAxisMin, yAxisMax] = yAxisRange;

    if (!chartData.length) {
      return {
        greenTop: yAxisMax,
        greenBottom: 0,
        yellowTop: 0,
        yellowBottom: -10,
        redBottom: yAxisMin,
        referenceLineY: 0,
      };
    }

    const percentages = chartData.map((item) => item.percentage);
    const minPercentage = Math.min(...percentages);
    const maxPercentage = Math.max(...percentages);

    // Calculate dynamic zones based on data
    let greenBottom, yellowTop, yellowBottom, referenceLineY;

    if (minPercentage >= 0) {
      // All positive data - green zone starts from minimum data value
      greenBottom = minPercentage;
      yellowTop = 0;
      yellowBottom = -10;
      // Reference line should be at the minimum data value (start of green zone)
      referenceLineY = minPercentage;
    } else if (maxPercentage <= 0) {
      // All negative data - yellow zone from 0% to -10%, red zone below -10%
      greenBottom = yAxisMax; // No green zone visible
      yellowTop = 0;
      yellowBottom = -10;
      // Reference line should be at 0%
      referenceLineY = 0;
    } else {
      // Mixed data - yellow zone from 0% to -10%
      greenBottom = 0;
      yellowTop = 0;
      yellowBottom = -10;
      // Reference line should be at 0%
      referenceLineY = 0;
    }

    return {
      greenTop: yAxisMax,
      greenBottom,
      yellowTop,
      yellowBottom,
      redBottom: yAxisMin,
      referenceLineY,
    };
  }, [chartData, yAxisRange]);

  if ((!chartData || chartData?.length === 0) && !isFetching) {
    return <ChartNoData type="ndlp-price" />;
  }

  return (
    <ConditionRenderer
      when={!isLoading}
      fallback={<Skeleton className="w-full h-[351px]" />}
    >
      <div className="flex flex-col gap-3 md:gap-6">
        <div className="flex items-center justify-between">
          <span className="text-white md:text-sm text-xs font-medium">
            {getZoneMessage(chartData)}
          </span>
        </div>
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
              margin={{ top: 40, left: 20, right: 0, bottom: 10 }}
              width={isMobile ? 364 : 500}
              height={isMobile ? 278 : 300}
            >
              <defs>
                <linearGradient
                  id="greenGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.70)" />
                  <stop offset="38.16%" stopColor="rgba(16, 185, 129, 0.39)" />
                  <stop offset="76.32%" stopColor="rgba(16, 185, 129, 0.10)" />
                </linearGradient>
                <linearGradient
                  id="yellowGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="#FBBF24" stopOpacity={0} />
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity={1} />
                </linearGradient>
                <linearGradient
                  id="redGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                  gradientUnits="objectBoundingBox"
                >
                  <stop offset="0%" stopColor="rgba(239, 68, 68, 0.90)" />
                  <stop offset="50%" stopColor="rgba(239, 68, 68, 0.70)" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0.30)" />
                </linearGradient>
                <linearGradient
                  id="customLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#F2BB89" />
                  <stop offset="50%" stopColor="#F3D2B5" />
                  <stop offset="100%" stopColor="#F5C8A4" />
                </linearGradient>
              </defs>
              <ReferenceArea
                yAxisId="percentage"
                y1={referenceAreaBounds.greenBottom}
                y2={referenceAreaBounds.greenTop}
                fill="url(#greenGradient)"
                radius={[10, 10, 0, 0]}
              />
              <ReferenceArea
                yAxisId="percentage"
                y1={referenceAreaBounds.yellowBottom}
                y2={referenceAreaBounds.yellowTop}
                fill="url(#yellowGradient)"
              />
              <ReferenceArea
                yAxisId="percentage"
                y1={yAxisRange[0]}
                y2={referenceAreaBounds.yellowBottom}
                fill="url(#redGradient)"
                radius={[0, 0, 10, 10]}
              />
              <ReferenceLine
                yAxisId="percentage"
                y={referenceAreaBounds.referenceLineY}
                stroke="#6b7280"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload, index }) => {
                  const total = chartData.length;
                  const isFirst = index === 0;

                  // Check if this tick represents the last data point
                  const lastDataPoint = chartData[total - 1];
                  const isLast = payload.value === lastDataPoint?.time;

                  return (
                    <text
                      x={x}
                      y={y + 8}
                      fontSize={12}
                      className="text-white/75 md:text-xs text-[10px]"
                      fill="#fff"
                      textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                    >
                      {isWeek
                        ? formatDate(payload.value, "dd/MM HH:mm")
                        : formatDate(payload.value, "HH:mm")}
                    </text>
                  );
                }}
                tickMargin={12}
                interval={interval}
              />
              <YAxis
                yAxisId="price"
                orientation="left"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) =>
                  formatNumber(value, 0, value < 1 ? 6 : 2)
                }
                axisLine={false}
                tickLine={false}
                tick={<CustomTick />}
              >
                <Label
                  value="Price"
                  angle={0}
                  position="insideTop"
                  offset={-30}
                  style={{
                    textAnchor: "end",
                    fill: "#FFFFFF",
                    fontSize: "12px",
                  }}
                />
              </YAxis>
              <YAxis
                yAxisId="percentage"
                orientation="right"
                domain={yAxisRange}
                ticks={yAxisTicks}
                tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}%`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#FFFFFF", fontSize: 12 }}
                tickMargin={10}
              >
                <Label
                  value="%"
                  angle={0}
                  position="insideTop"
                  offset={-30}
                  style={{
                    textAnchor: "start",
                    fill: "#FFFFFF",
                    fontSize: "12px",
                  }}
                />
              </YAxis>
              <Legend content={<CustomLegend />} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="price"
                stroke="url(#customLineGradient)"
                strokeWidth={2}
                dot={({ cx, cy, index }) =>
                  index === lastItemIndex ? (
                    <Fragment key={index}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="white"
                        style={{
                          filter: "blur(3px)",
                          opacity: 0,
                          animation: "fadeInDot 1s 1.25s forwards",
                        }}
                        className="animate-pulse"
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="black"
                        stroke="#fff"
                        strokeWidth={2.5}
                        style={{
                          opacity: 0,
                          animation: "fadeInDot 1s 1.25s forwards",
                        }}
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
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="percentage"
                stroke="transparent"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ConditionRenderer>
  );
};

export default MyNdlpPriceChart;
