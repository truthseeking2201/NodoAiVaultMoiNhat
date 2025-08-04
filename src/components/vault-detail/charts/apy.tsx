import { useState, useEffect, Fragment, useMemo } from "react";
import {
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from "recharts";

import { PERIOD_TABS } from "../constant";
import { formatDate } from "@/utils/date";
import { formatShortCurrency } from "@/utils/currency";
import EmptyChartState from "@/components/ui/empty-chart-state";
import ConditionRenderer from "@/components/shared/condition-renderer";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomTooltipProps {
  payload?: any[];
  label?: string;
}

interface APYChartProps {
  period: string;
  analyticsData: any;
  isLoading?: boolean;
}

/**
 * Custom tooltip component for different chart types
 */
const CustomTooltip: React.FC<CustomTooltipProps> = ({ payload, label }) => {
  const data = payload[0]?.payload;
  if (!data) {
    return null;
  }
  return (
    <div className="bg-black p-3 border border-white/20 rounded-lg shadow-lg w-[250px]">
      <div className="text-xs font-bold text-white mb-[6px]">
        {formatDate(label, "dd MMM yyyy HH:mm")}
      </div>
      <div className="flex items-end justify-between mb-1">
        <span className="font-medium text-xs text-white/80">APY: </span>
        <span className="font-mono text-sm font-semibold text-white">
          {Number(data.apy).toFixed(2)}%
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="font-medium text-xs text-white/80">
          Cumulative Yields:
        </span>
        <span className="font-mono text-sm font-semibold text-white">
          {Number(data.totalCumulativeYields).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

const APYChart = ({ period, analyticsData, isLoading }: APYChartProps) => {
  const chartData = useMemo(() => {
    const result = [];
    let lastApy = 0;
    let lastCumulativeYields = 0;
    let lastTotalCumulativeYields = 0;
    let started = false;

    for (const item of analyticsData?.list || []) {
      // Only start adding data after the first non-zero apy value
      if (!started && Number(item.value.apy) === 0) continue;
      if (!started && Number(item.value.apy) !== 0) started = true;

      let apy = Number(item.value.apy);
      if (apy === 0 && result.length > 0) {
        apy = lastApy;
      }
      let cumulativeYields = Number(item.value.lp_fee);
      if (cumulativeYields === 0 && result.length > 0) {
        cumulativeYields = lastCumulativeYields;
      }
      let totalCumulativeYields = Number(item.value.acc_lp_fee);
      if (totalCumulativeYields === 0 && result.length > 0) {
        totalCumulativeYields = lastTotalCumulativeYields;
      }

      result.push({
        timestamp: item.value.date,
        cumulativeYields: cumulativeYields.toFixed(4) || 0,
        totalCumulativeYields: totalCumulativeYields.toFixed(4) || 0,
        apy: apy.toFixed(4) || 0,
      });

      lastApy = apy;
      lastCumulativeYields = cumulativeYields;
      lastTotalCumulativeYields = totalCumulativeYields;
    }
    return result;
  }, [analyticsData]);

  const isHasData = useMemo(() => {
    return (
      chartData &&
      chartData.reduce((sum: number, item: any) => sum + Number(item.apy), 0) >
        0
    );
  }, [chartData]);

  if (!chartData || chartData?.length === 0) {
    return <EmptyChartState />;
  }

  return (
    <ConditionRenderer
      when={!isLoading}
      fallback={<Skeleton className="w-full h-[400px]" />}
    >
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={chartData}
          margin={{ top: 30, right: 0, left: 0, bottom: 7 }}
        >
          <defs>
            <linearGradient id="priceLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#9DEBFF" />
              <stop offset="100%" stopColor="#00FF5E" />
            </linearGradient>
            <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00FF5E" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#00FF5E" stopOpacity="0" />
            </radialGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tick={{
              fontSize: 12,
              fontFamily: "sans-serif",
              fill: "#fff",
              dominantBaseline: "hanging",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) =>
              period === PERIOD_TABS[1].value
                ? formatDate(value, "dd/MM")
                : formatDate(value, "HH:mm")
            }
          />
          <YAxis
            yAxisId="left"
            dataKey="apy"
            tick={{ fontSize: 12, fontFamily: "monospace", fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
            label={{
              value: "APY",
              position: "top",
              dx: 15,
              offset: 20,
              className: "font-mono text-white/80 text-xs",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            dataKey="totalCumulativeYields"
            tick={{ fontSize: 12, fontFamily: "monospace", fill: "#fff" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${formatShortCurrency(value, 2)}`}
            label={{
              value: "USDC",
              position: "top",
              dx: -10,
              offset: 20,
              className: "font-mono text-white/80 text-xs",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={
              <div className="flex gap-[200px] px-4 py-2 justify-center">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-block",
                      width: 100,
                      height: 3,
                      background:
                        "linear-gradient(90deg, #9DEBFF 0%, #00FF5E 100%)",
                      borderRadius: 1,
                    }}
                  />
                  <span className="text-sm text-white font-bold">
                    Cumulative Yields
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      display: "inline-block",
                      width: 38,
                      height: 12,
                      background: "rgba(253, 235, 207, 0.6)",
                      borderRadius: 2,
                    }}
                  />
                  <span className="text-sm text-white font-bold">APY</span>
                </div>
              </div>
            }
          />
          <Bar
            yAxisId="left"
            dataKey="apy"
            fill="rgba(253, 235, 207, 0.6)"
            opacity={0.7}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalCumulativeYields"
            stroke="url(#priceLineGradient)"
            strokeWidth={2}
            dot={({ cx, cy, index }) => {
              if (isHasData && index === chartData.length - 1) {
                return (
                  <Fragment key={index}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={16}
                      fill="url(#dotGradient)"
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
                      fill="#00FF5E"
                      stroke="#fff"
                      strokeWidth={1}
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
                );
              }
            }}
            isAnimationActive={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ConditionRenderer>
  );
};

export default APYChart;
