"use client";

import { DashboardData } from "@/services/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "../ui/chart";
import { Label } from "recharts";

const ByStatusDistribution = ({
  data,
}: {
  data: DashboardData["totalLeadsByStatus"];
}) => {
  const chartConfig = {
    count: {
      label: "Leads",
    },
    OPEN: {
      label: "Open",
      color: "var(--chart-1)",
    },
    WON: {
      label: "Won",
      color: "var(--chart-2)",
    },
    LOST: {
      label: "Lost",
      color: "var(--chart-5)",
    },
  } satisfies ChartConfig;

  const chartData = data.map((item) => ({
    name: item.status,
    value: item.count,
    fill: (chartConfig as any)[item.status]?.color || "var(--chart-3)",
  }));

  return (
    <Card className="flex flex-col border-none shadow-lg bg-linear-to-br from-card to-card/50">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-xl font-bold tracking-tight">
          Status Distribution
        </CardTitle>
        <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
          Lead Lifecycle
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <linearGradient id="gradient-OPEN" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-1)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
                <linearGradient id="gradient-WON" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-2)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
                <linearGradient id="gradient-LOST" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--chart-5)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--chart-5)"
                    stopOpacity={0.6}
                  />
                </linearGradient>
              </defs>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={8}
                stroke="none"
                animationBegin={200}
                animationDuration={1500}
                animationEasing="ease-out"
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const total = chartData.reduce(
                        (acc, curr) => acc + curr.value,
                        0,
                      );
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) -25}
                            className="fill-foreground text-5xl font-black tracking-tighter"
                          >
                            {total.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0)}
                            className="fill-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]"
                          >
                            Total Leads
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#gradient-${entry.name})`}
                    style={{ outline: "none" }}
                  />
                ))}
              </Pie>
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="mt-4 flex-wrap gap-x-4 gap-y-2 justify-center text-[10px] font-bold uppercase tracking-wider"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ByStatusDistribution;
