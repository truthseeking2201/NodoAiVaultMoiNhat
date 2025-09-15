import React, { Fragment, useMemo, FC } from "react";
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
import { ChartDataPoint, PERIOD_TABS } from "../constant";
import useBreakpoint from "@/hooks/use-breakpoint";
import { CustomTooltipProps } from "./type";
import PriceChange from "@/components/shared/price-change";
import { formatDate } from "@/utils/date";
import { formatNumber } from "@/lib/number";

const CustomLegend = () => {
  const { isMobile } = useBreakpoint();
  return (
    <div className="flex gap-4 justify-center mt-4">
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

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const priceData = payload[0]?.payload;

  if (!priceData) return null;

  const ndlpPrice = Number(priceData.price);
  const breakEvenPrice = Number(priceData.breakEvenPrice) || 0;
  const percentage = Number(priceData.percentage) || 0;
  const time = priceData.time;

  return (
    <div className="bg-black p-3 border border-white/20 rounded-lg shadow-lg w-[250px]">
      <div className="text-xs font-bold text-white mb-[6px]">{label}</div>
      {ndlpPrice && (
        <div className="flex items-end justify-between mb-1">
          <span className="font-medium text-xs text-white/80">
            NDLP Price:{" "}
          </span>
          <div className="flex items-center gap-1">
            <span className="font-mono text-sm font-semibold text-white">
              {ndlpPrice}
            </span>
            <PriceChange
              priceChange={percentage}
              showParentheses={false}
              showPeriod={false}
            />
          </div>
        </div>
      )}
      <div className="flex items-end justify-between">
        <span className="font-medium text-xs text-white/80">
          Break Even Price:{" "}
        </span>
        <span className="font-mono text-sm font-semibold text-white">
          ${formatNumber(breakEvenPrice, 0, breakEvenPrice < 1 ? 6 : 2)}
        </span>
      </div>
    </div>
  );
};

interface NdlpPriceChartProps {
  periodTab: string;
  ndlpPriceData?: any;
}

const NdlpPriceChart = ({ periodTab, ndlpPriceData }: NdlpPriceChartProps) => {
  const { isMobile } = useBreakpoint();

  const isWeek = useMemo(() => {
    return periodTab === PERIOD_TABS[1].value;
  }, [periodTab]);

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!ndlpPriceData) return [];

    const chartData = [];

    for (const item of ndlpPriceData) {
      chartData.push({
        time: item.timestamp,
        price: item.ndlp_price,
        breakEvenPrice: item.user_break_event_price,
        percentage: item.performance_percent,
      });
    }

    return chartData;
  }, [ndlpPriceData]);

  const checkPositionOfPrice = useMemo(() => {
    for (let i = chartData.length - 1; i >= 0; i--) {
      if (
        typeof chartData[i].price === "number" &&
        !isNaN(chartData[i].price)
      ) {
        return i;
      }
    }
    return null;
  }, [chartData]);

  const interval = useMemo(
    () => (isWeek ? (isMobile ? 20 : 10) : 3),
    [isWeek, isMobile]
  );

  return (
    <div className="flex flex-col gap-3">
      <span className="text-white md:text-sm text-xs font-medium">
        Track the NDLP price of this vault over time
      </span>
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
            margin={{ top: 20, left: -10, right: 10, bottom: 10 }}
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
                <stop offset="50.48%" stopColor="#F3D2B5" />
                <stop offset="100%" stopColor="#F5C8A4" />
              </linearGradient>
            </defs>
            <ReferenceArea
              y1={0}
              y2={15}
              fill="url(#greenGradient)"
              radius={[10, 10, 0, 0]}
            />
            <ReferenceArea y1={-5} y2={0} fill="url(#yellowGradient)" />
            <ReferenceArea
              y1={-15}
              y2={-5}
              fill="url(#redGradient)"
              radius={[0, 0, 10, 10]}
            />
            <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
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
              domain={[-15, 15]}
              ticks={[-15, -10, -5, 0, 5, 10, 15]}
              tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}%`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#FFFFFF", fontSize: 12 }}
              tickMargin={10}
            />

            <Legend content={<CustomLegend />} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="percentage"
              stroke="url(#customLineGradient)"
              strokeWidth={2}
              dot={({ cx, cy, index }) =>
                index === checkPositionOfPrice ? (
                  <Fragment key={index}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={8}
                      fill="white"
                      style={{ filter: "blur(6px)" }}
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
                  </Fragment>
                ) : null
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NdlpPriceChart;
