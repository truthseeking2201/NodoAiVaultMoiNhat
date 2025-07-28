import React, { useState, useEffect, Fragment, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
  Dot,
} from "recharts";
import { mockDataLiveChart, mockDataLiveChart2 } from "../constant";

const UserPosition = ({ period }) => {
  console.log("UserPosition rendered with period:", period);
  const [timeFilter, setTimeFilter] = useState(period);

  const chartData = useMemo(() => {
    if (timeFilter === "D") {
      return mockDataLiveChart;
    } else if (timeFilter === "W") {
      return mockDataLiveChart2;
    }
    return mockDataLiveChart; // Mặc định trả về dữ liệu ngày nếu không có điều kiện nào khác
  }, [timeFilter]);

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

  useEffect(() => {
    setTimeFilter(period);
  }, [period]);

  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          width={500}
          height={300}
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
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.80)" />
              <stop offset="48%" stopColor="rgba(239, 68, 68, 0.80)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.20)" />
            </linearGradient>
            <linearGradient id="customLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F2BB89" />
              <stop offset="50.48%" stopColor="#F3D2B5" />
              <stop offset="100%" stopColor="#F5C8A4" />
            </linearGradient>
          </defs>
          <ReferenceArea y1={0} y2={15} fill="url(#greenGradient)" />
          <ReferenceArea y1={-5} y2={0} fill="url(#yellowGradient)" />
          <ReferenceArea y1={-15} y2={-5} fill="url(#redGradient)" />

          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />

          {/* <CartesianGrid strokeDasharray="3 3" stroke="#374151" /> */}

          <XAxis
            dataKey="time"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />

          <YAxis
            domain={[-15, 15]}
            tickFormatter={(value) => `${value > 0 ? "+" : ""}${value}%`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
          />

          <Tooltip />

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

export default UserPosition;
