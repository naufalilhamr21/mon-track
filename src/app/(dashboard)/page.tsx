"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Search, RefreshCw } from "lucide-react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { MonthlySummaryCard } from "@/components/dashboard/monthly-summary-card";
import { BudgetSheet } from "@/components/dashboard/budget-sheet";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { WalletCarousel } from "@/components/dashboard/wallet-carousel";
import { Toast, useToast } from "@/components/ui/toast";
import {
  calculateTotalExpense,
  calculateTotalIncome,
  calculateNetCashFlow,
  calculateTodaySpending,
  calculateCategorySpending,
} from "@/lib/calculations/transaction-calculations";
import {
  calculateBudgetRemaining,
  calculateBudgetPercentage,
  getBudgetStatus,
} from "@/lib/calculations/budget-calculations";
import { cn } from "@/lib/utils";
import { syncEngine } from "@/lib/sync-engine";
import type { Transaction } from "@/types/transaction";

function getGreetingText(): string {
  const h = new Date().getHours();
  if (h < 5) return "malam";
  if (h < 12) return "pagi";
  if (h < 17) return "siang";
  if (h < 21) return "sore";
  return "malam";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const settings = useSettingsStore((s) => s.settings);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const [budgetOpen, setBudgetOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  // editTransaction kept for future use via global event
  const [, setEditTransaction] = useState<Transaction | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const handleRefresh = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const userIdentifier = session?.user?.email || session?.user?.id;
    try {
      const res = await syncEngine.syncAll(userIdentifier);
      await Promise.all([loadTransactions(), loadSettings()]);
      if (res.success) {
        showToast("Data tersinkronkan", "success");
      } else {
        showToast(`Gagal sinkron: ${res.error || "Cek koneksi"}`, "error");
      }
    } catch {
      showToast("Gagal menyinkronkan data", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;
  const monthTransactions = transactions.filter((t) => t.date.startsWith(prefix));

  const monthlySpending = calculateTotalExpense(monthTransactions);
  const monthlyIncome = calculateTotalIncome(monthTransactions);
  const netCashFlow = calculateNetCashFlow(monthTransactions);
  const todaySpending = calculateTodaySpending(transactions);
  const budgetRemaining = calculateBudgetRemaining(settings.monthlyBudget, monthlySpending);
  const budgetPercentage = calculateBudgetPercentage(settings.monthlyBudget, monthlySpending);
  const budgetStatus = getBudgetStatus(settings.monthlyBudget, monthlySpending);
  const categorySpending = calculateCategorySpending(monthTransactions, categories);

  const recentTransactions = [...transactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const firstName = session?.user?.name?.split(" ")[0] ?? "";
  const fullDateFormatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="min-h-dvh pb-8">
      {/* ── Green-White-Blue Atmospheric Aurora Header ── */}
      <div className="bg-aurora-header px-4 pt-5 pb-7">
        <div className="mx-auto max-w-lg">
          {/* 1. Utility Controls Row */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/settings"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs text-slate-900 font-bold text-sm transition-transform active:scale-95"
              title="Pengaturan Akun"
            >
              {firstName ? firstName.slice(0, 2).toUpperCase() : "MT"}
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/transactions"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs text-slate-600 hover:text-slate-900 transition-transform active:scale-95"
                aria-label="Cari transaksi"
                title="Pencarian"
              >
                <Search className="h-5 w-5" strokeWidth={2} />
              </Link>
              <button
                onClick={handleRefresh}
                disabled={isSyncing}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-xs text-slate-600 hover:text-slate-900 transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
                aria-label="Segarkan data"
                title="Sinkronisasi Cloud"
              >
                <RefreshCw
                  className={cn("h-5 w-5", isSyncing && "animate-spin text-slate-900")}
                  strokeWidth={2}
                />
              </button>
            </div>
          </div>

          {/* 2. Date / Eyebrow */}
          <p className="text-xs font-semibold text-slate-500 capitalize mb-0.5">
            {fullDateFormatted}
          </p>

          {/* 3. Good morning / User Name (No Emoji) */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Selamat {getGreetingText()},{" "}
            <span className="font-extrabold text-slate-900">{firstName || "Kawan"}</span>
          </h1>
        </div>
      </div>

      {/* ── Main Content Body ── */}
      <div className="mx-auto max-w-lg px-4 -mt-4 space-y-4">
        {/* Monthly Summary Hero Card */}
        <MonthlySummaryCard
          spending={monthlySpending}
          income={monthlyIncome}
          netCashFlow={netCashFlow}
          budget={settings.monthlyBudget}
          remaining={budgetRemaining}
          percentage={budgetPercentage}
          status={budgetStatus}
          onEditBudget={() => setBudgetOpen(true)}
        />

        {/* Wallet Carousel */}
        <WalletCarousel />

        {/* Quick Stats */}
        <QuickStats
          todaySpending={todaySpending}
          transactionCount={monthTransactions.length}
        />

        {/* Category Chart */}
        {categorySpending.length > 0 && (
          <CategoryChart data={categorySpending} />
        )}

        {/* Recent Transactions */}
        <RecentTransactions
          transactions={recentTransactions}
          categories={categories}
          onEditTransaction={setEditTransaction}
        />
      </div>

      {/* Budget Bottom Sheet */}
      <BudgetSheet
        open={budgetOpen}
        onOpenChange={setBudgetOpen}
        onSuccess={() => {
          showToast("Anggaran bulanan berhasil disimpan", "success");
        }}
      />

      {/* Toast Feedback */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
}
