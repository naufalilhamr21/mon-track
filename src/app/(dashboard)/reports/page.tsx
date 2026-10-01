"use client";

import { useState } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import {
  calculateTotalSpending,
  calculateTotalIncome,
  calculateNetCashFlow,
  calculateDailySpending,
  calculateCategorySpending,
  calculateAverageDailySpending,
  calculateMonthlyComparison,
  findLargestTransaction,
  findLargestCategory,
} from "@/lib/calculations/transaction-calculations";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Sparkles,
  BarChart3,
} from "lucide-react";

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

export default function ReportsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(monthPrefix));

  const totalSpending = calculateTotalSpending(monthTransactions);
  const totalIncome = calculateTotalIncome(monthTransactions);
  const netCashFlow = calculateNetCashFlow(monthTransactions);
  const dailySpending = calculateDailySpending(monthTransactions);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);
  const avgDaily = calculateAverageDailySpending(monthTransactions);
  const largest = findLargestTransaction(monthTransactions);
  const largestCat = findLargestCategory(monthTransactions, categories);
  const monthlyComparison = calculateMonthlyComparison(transactions, 6);

  const dailyChartData = dailySpending.map((d) => ({
    day: parseInt(d.date.split("-")[2]),
    total: d.total,
  }));

  const navigateMonth = (offset: number) => {
    setSelectedDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltipValue = (value: any) => formatCurrency(Number(value ?? 0));

  const tooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: "16px",
    border: "1px solid rgba(226, 232, 240, 0.9)",
    boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08)",
    color: "#0F172A",
    fontSize: "12px",
    fontWeight: 700,
    padding: "8px 14px",
  };

  const isPositive = netCashFlow >= 0;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analitik</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">
            Ringkasan &amp; tren keuangan
          </p>
        </div>
        {/* Month Selector Pill */}
        <div className="flex items-center gap-1 rounded-full p-1 bg-white border border-slate-200/80 shadow-xs">
          <button
            onClick={() => navigateMonth(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[6.5rem] text-center text-xs font-bold text-slate-800">
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Net Cash Flow Hero ── */}
      <div className="fun-card p-5 mb-4 transition-all">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Arus Kas Bersih
          </p>
          <p className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
            {isPositive ? "+" : "-"}{formatCurrency(Math.abs(netCashFlow))}
          </p>
          <div className="mt-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-700 border border-slate-200/80">
              {isPositive ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-slate-900" />
                  <span>Surplus bulan ini</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3.5 w-3.5 text-slate-600" />
                  <span>Defisit bulan ini</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid (2-column compact metric cards) ── */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatCard
          label="Pengeluaran"
          value={formatCurrency(totalSpending)}
          icon={TrendingDown}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
        />
        <StatCard
          label="Pemasukan"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconBg="bg-slate-100"
          iconColor="text-slate-900"
        />
        <StatCard
          label="Rata-rata / Hari"
          value={formatCurrency(avgDaily)}
          icon={CalendarDays}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
        />
        <StatCard
          label="Terbesar"
          value={largest ? formatCurrency(largest.amount) : "-"}
          subValue={largestCat?.category.name}
          icon={Sparkles}
          iconBg="bg-slate-100"
          iconColor="text-slate-700"
        />
      </div>

      {/* ── Daily Bar Chart ── */}
      {dailyChartData.length > 0 && (
        <div className="fun-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Pengeluaran Harian
          </p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} barCategoryGap="25%">
                <defs>
                  <linearGradient id="auroraDailyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  formatter={formatTooltipValue}
                  labelFormatter={(day) => `Tanggal ${day}`}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "rgba(37, 99, 235, 0.05)" }}
                />
                <Bar dataKey="total" fill="url(#auroraDailyBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Category Donut ── */}
      {categorySpending.length > 0 && (
        <div className="fun-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Porsi per Kategori
          </p>
          <div className="flex items-center gap-5">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending.slice(0, 6)}
                    dataKey="total"
                    innerRadius={34}
                    outerRadius={56}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {categorySpending.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={AURORA_CHART_COLORS[i % AURORA_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {categorySpending.slice(0, 6).map((item, idx) => (
                <div key={item.category.id} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full shadow-xs"
                    style={{ backgroundColor: AURORA_CHART_COLORS[idx % AURORA_CHART_COLORS.length] }}
                  />
                  <span className="flex-1 truncate text-xs font-semibold text-slate-700">
                    {item.category.name}
                  </span>
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums bg-slate-100 text-slate-800">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Monthly Comparison (6 Months) ── */}
      {monthlyComparison.some((m) => m.total > 0) && (
        <div className="fun-card mb-4 p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Tren 6 Bulan Terakhir
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyComparison} barCategoryGap="25%">
                <defs>
                  <linearGradient id="auroraMonthlyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.95} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={formatTooltipValue} contentStyle={tooltipStyle} cursor={{ fill: "rgba(79, 70, 229, 0.05)" }} />
                <Bar dataKey="total" fill="url(#auroraMonthlyBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {monthTransactions.length === 0 && (
        <div className="fun-card mt-8 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold text-slate-900">Belum ada data bulan ini</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Pilih bulan lain atau catat transaksi baru dengan tombol + di kanan bawah
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="fun-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <div className="text-base sm:text-lg font-extrabold tabular-nums tracking-tight text-slate-900">
        {value}
      </div>
      {subValue && (
        <div className="mt-0.5 text-xs font-semibold text-slate-400 truncate">
          {subValue}
        </div>
      )}
    </div>
  );
}
