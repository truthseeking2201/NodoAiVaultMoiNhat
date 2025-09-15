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
} from "recharts";
import {
  ChartDataPoint,
  mockDataLiveChart,
  mockDataLiveChart2,
  PERIOD_TABS,
} from "../constant";
import useBreakpoint from "@/hooks/use-breakpoint";
import { CustomTooltipProps } from "./type";
import PriceChange from "@/components/shared/price-change";

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
      <div className="text-xs font-bold text-white mb-[6px]">
        {label}
      </div>
      {ndlpPrice && (
        <div className="flex items-end justify-between mb-1">
          <span className="font-medium text-xs text-white/80">
            NDLP Price:{" "}
          </span>
          <span className="font-mono text-sm font-semibold text-white">
            {ndlpPrice}
          </span>
          <PriceChange priceChange={percentage} showParentheses={false} showPeriod={false} />
        </div>
      )}
      <div className="flex items-end justify-between">
        <span className="font-medium text-xs text-white/80">
          Break Even Price:{" "}
        </span>
        <span className="font-mono text-sm font-semibold text-white">
          {breakEvenPrice}
        </span>
      </div>
    </div>
  );
};

const NdlpPrice = ({ periodTab }: { periodTab: string }) => {
  const { isMobile } = useBreakpoint();

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (periodTab === PERIOD_TABS[0].value) {
      return mockDataLiveChart;
    } else if (periodTab === PERIOD_TABS[1].value) {
      return mockDataLiveChart2;
    }
    return mockDataLiveChart; // Default to daily data
  }, [periodTab]);

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

  return (
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
          margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
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
            <linearGradient id="customLineGradient" x1="0" y1="0" x2="1" y2="0">
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

          {/* <CartesianGrid strokeDasharray="3 3" stroke="#374151" /> */}

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#FFFFFFBF", fontSize: 12 }}
            tickMargin={10}
          />

          <YAxis
            domain={[-15, 15]}
            tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#FFFFFF", fontSize: 12 }}
          />
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
                    strokeWidth={2}
                  />
                </Fragment>
              ) : null
            }
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NdlpPrice;
