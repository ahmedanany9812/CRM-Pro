"use client"

import { DashboardData } from "@/services/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, XAxis, Bar, CartesianGrid, LabelList, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";

const ByStageBreakdown = ({
  data,
}: {
  data: DashboardData["totalLeadsByStage"];
}) => {
  const chartConfig = {
    count: {
      label: "Leads",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="col-span-1 lg:col-span-3 border-none shadow-2xl bg-linear-to-br from-card to-card/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <div className="h-24 w-24 rounded-full bg-primary blur-3xl" />
      </div>
      <CardHeader className="pb-2 border-b border-border/50 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight">Leads by Stage</CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Live Pipeline</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              accessibilityLayer 
              data={data}
              margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                vertical={false} 
                strokeDasharray="3 3" 
                stroke="rgba(0,0,0,0.05)"
              />
              <XAxis
                dataKey="stage"
                tickLine={false}
                tickMargin={12}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                tickFormatter={(value) => value.toString()}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar 
                dataKey="count" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
                maxBarSize={50}
                animationBegin={200}
                animationDuration={1200}
                animationEasing="ease-in-out"
              >
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground font-bold"
                  fontSize={14}
                  formatter={(value: any) => (value === 0 || value === undefined) ? "" : value}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ByStageBreakdown;
