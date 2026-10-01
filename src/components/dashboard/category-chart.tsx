"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Category } from "@/types/category";

interface CategoryChartProps {
  data: { category: Category; total: number; percentage: number }[];
}

const AURORA_CHART_COLORS = [
  "#2563EB", // Royal Blue
  "#38BDF8", // Cyan Sky
  "#6366F1", // Indigo Violet
  "#10B981", // Emerald Mint
  "#F59E0B", // Warm Amber
  "#EC4899", // Rose Pink
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
];

export function CategoryChart({ data }: CategoryChartProps) {
  const top5 = data.slice(0, 5);

  return (
    <div className="fun-card p-5">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        Pengeluaran Per Kategori
      </p>
      <div className="flex items-center gap-5">
        {/* Donut Chart */}
        <div className="h-28 w-28 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={top5}
                dataKey="total"
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={52}
                paddingAngle={3}
                strokeWidth={0}
              >
                {top5.map((_, i) => (
                  <Cell key={i} fill={AURORA_CHART_COLORS[i % AURORA_CHART_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {top5.map((item, idx) => (
            <div key={item.category.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
                  style={{ backgroundColor: AURORA_CHART_COLORS[idx % AURORA_CHART_COLORS.length] }}
                />
                <span className="truncate text-xs font-semibold text-slate-700">
                  {item.category.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-slate-900">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
