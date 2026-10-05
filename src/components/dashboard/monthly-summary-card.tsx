"use client";

import { formatCurrency, cn } from "@/lib/utils";
import type { BudgetStatus } from "@/lib/calculations/budget-calculations";
import { SlidersHorizontal, ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, ReceiptText } from "lucide-react";

export type CashFlowTimeframe = "daily" | "weekly" | "monthly";

interface MonthlySummaryCardProps {
  timeframe?: CashFlowTimeframe;
  onTimeframeChange?: (timeframe: CashFlowTimeframe) => void;
  spending: number;
  income: number;
  netCashFlow: number;
  transactionCount?: number;
  budget?: number;
  remaining: number | null;
  percentage: number | null;
  status: BudgetStatus;
  onEditBudget?: () => void;
}

export function MonthlySummaryCard({
  timeframe = "monthly",
  onTimeframeChange,
  spending,
  income,
  netCashFlow,
  transactionCount = 0,
  budget,
  remaining,
  percentage,
  onEditBudget,
}: MonthlySummaryCardProps) {
  const clampedPercentage = percentage !== null ? Math.min(percentage, 100) : 0;
  const isPositiveFlow = netCashFlow >= 0;

  const timeframeLabels: Record<CashFlowTimeframe, { title: string; short: string }> = {
    daily: { title: "Arus Kas Hari Ini", short: "Hari Ini" },
    weekly: { title: "Arus Kas Minggu Ini", short: "Minggu Ini" },
    monthly: { title: "Arus Kas Bulan Ini", short: "Bulan Ini" },
  };

  const currentLabel = timeframeLabels[timeframe];

  return (
    <div className="space-y-3">
      {/* ── Hero — Clean White Card ── */}
      <div className="fun-card p-5 transition-all">
        {/* Timeframe Switcher Pill Selector */}
        {onTimeframeChange && (
          <div className="flex items-center bg-slate-100/90 p-1 rounded-full mb-4 border border-slate-200/60">
            <button
              type="button"
              onClick={() => onTimeframeChange("daily")}
              className={cn(
                "flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all duration-200 cursor-pointer",
                timeframe === "daily"
                  ? "aurora-glass-active shadow-xs text-white font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Harian
            </button>
            <button
              type="button"
              onClick={() => onTimeframeChange("weekly")}
              className={cn(
                "flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all duration-200 cursor-pointer",
                timeframe === "weekly"
                  ? "aurora-glass-active shadow-xs text-white font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Mingguan
            </button>
            <button
              type="button"
              onClick={() => onTimeframeChange("monthly")}
              className={cn(
                "flex-1 py-1.5 text-center text-xs font-bold rounded-full transition-all duration-200 cursor-pointer",
                timeframe === "monthly"
                  ? "aurora-glass-active shadow-xs text-white font-extrabold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              Bulanan
            </button>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              {currentLabel.title}
            </p>
            <p className="text-3xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {isPositiveFlow ? "+" : "-"}{formatCurrency(Math.abs(netCashFlow))}
            </p>
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-700 border border-slate-200/80">
                {isPositiveFlow ? (
                  <>
                    <TrendingUp className="h-3.5 w-3.5 text-slate-900" />
                    <span>Surplus ({currentLabel.short})</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3.5 w-3.5 text-slate-600" />
                    <span>Defisit ({currentLabel.short})</span>
                  </>
                )}
              </span>
            </div>
          </div>
          <div>
            {onEditBudget && (
              <button
                onClick={onEditBudget}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Atur anggaran"
                title="Atur anggaran"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Income / Expense / Transaction Split Metric ── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Income Card */}
        <div className="fun-card p-3 sm:p-4 transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <ArrowDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-900" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Pemasukan
              </span>
              <span className="block text-[8px] sm:text-[9px] font-medium text-slate-400 truncate">
                {currentLabel.short}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-base font-extrabold tabular-nums tracking-tight text-slate-900 truncate">
            {formatCurrency(income)}
          </p>
        </div>

        {/* Expense Card */}
        <div className="fun-card p-3 sm:p-4 transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-600" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Pengeluaran
              </span>
              <span className="block text-[8px] sm:text-[9px] font-medium text-slate-400 truncate">
                {currentLabel.short}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-base font-extrabold tabular-nums tracking-tight text-slate-900 truncate">
            {formatCurrency(spending)}
          </p>
        </div>

        {/* Transaction Count Card */}
        <div className="fun-card p-3 sm:p-4 transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <ReceiptText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-800" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                Transaksi
              </span>
              <span className="block text-[8px] sm:text-[9px] font-medium text-slate-400 truncate">
                {currentLabel.short}
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-base font-extrabold tabular-nums tracking-tight text-slate-900 truncate">
            {transactionCount}
          </p>
        </div>
      </div>

      {/* ── Budget Progress ── */}
      {budget !== undefined && budget > 0 ? (
        <div
          onClick={onEditBudget}
          className="fun-card px-4 py-3.5 cursor-pointer hover:border-slate-300 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Target Anggaran Bulanan ({formatCurrency(budget)})
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                status === "exceeded"
                  ? "bg-red-50 text-red-600 border border-red-100"
                  : status === "warning"
                    ? "bg-amber-50 text-amber-700 border border-amber-100"
                    : "bg-slate-100 text-slate-900 border border-slate-200/80"
              )}
            >
              {percentage}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn(
                "budget-bar h-full rounded-full transition-all duration-500",
                status === "exceeded"
                  ? "bg-gradient-to-r from-red-500 to-rose-600"
                  : status === "warning"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600"
              )}
              style={{ width: `${clampedPercentage}%` }}
            />
          </div>
          <p className="mt-2 text-right text-xs font-semibold text-slate-600">
            {remaining !== null && remaining >= 0
              ? `Sisa ${formatCurrency(remaining)}`
              : remaining !== null
                ? `Lebih ${formatCurrency(Math.abs(remaining))}`
                : ""}
          </p>
        </div>
      ) : (
        <button
          onClick={onEditBudget}
          className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/80 px-4 py-3 text-xs font-bold text-slate-600 hover:border-slate-900 hover:text-slate-900 transition-all cursor-pointer"
        >
          <span>Atur target anggaran bulanan</span>
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
