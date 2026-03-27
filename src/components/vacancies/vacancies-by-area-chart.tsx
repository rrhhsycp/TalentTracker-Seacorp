"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AreaCount } from "@/lib/vacancy-metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function VacanciesByAreaChart({
  data,
  className,
}: {
  data: AreaCount[];
  className?: string;
}) {
  return (
    <Card className={cn("rounded-xl border-slate-200 shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900">
          Vacantes por área
        </CardTitle>
        <p className="text-xs font-normal text-slate-500">
          Conteo según posiciones registradas
        </p>
      </CardHeader>
      <CardContent className="h-[280px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis
              dataKey="area"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(248, 250, 252, 0.9)" }}
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}`, "Vacantes"]}
              labelFormatter={(label) => `Área: ${label}`}
            />
            <Bar
              dataKey="count"
              name="Vacantes"
              fill="#ea580c"
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
