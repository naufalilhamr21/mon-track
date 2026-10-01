"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import type { Category } from "@/types/category";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useWalletStore } from "@/stores/wallet-store";
import { cn } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onEditTransaction?: (transaction: Transaction) => void;
}

export function RecentTransactions({
  transactions,
  categories,
  onEditTransaction,
}: RecentTransactionsProps) {
  const wallets = useWalletStore((s) => s.wallets);
  const [selectedCatId, setSelectedCatId] = useState<string>("all");

  const filteredTransactions =
    selectedCatId === "all"
      ? transactions
      : transactions.filter((t) => t.categoryId === selectedCatId);

  // Get active categories that have transactions or top categories
  const filterCategories = [
    { id: "all", name: "Semua" },
    ...categories.filter((c) => transactions.some((t) => t.categoryId === c.id)).slice(0, 6),
  ];

  return (
    <div className="space-y-3">
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-slate-900">
          Transaksi Terbaru
        </h2>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <span>Lihat semua</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ── Category Chips Filter ── */}
      {transactions.length > 0 && filterCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {filterCategories.map((cat) => {
            const isActive = selectedCatId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCatId(cat.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all cursor-pointer active:scale-95",
                  isActive
                    ? "aurora-glass-active shadow-xs"
                    : "bg-white text-slate-500 border border-slate-100/90 hover:bg-slate-50"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Transactions List ── */}
      {filteredTransactions.length === 0 ? (
        <div className="fun-card p-8 text-center">
          <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-800">Belum ada transaksi</p>
          <p className="mt-0.5 text-xs text-slate-400">
            Ketuk tombol + di kanan bawah untuk mencatat transaksi baru
          </p>
        </div>
      ) : (
        <div className="fun-card p-2 space-y-1">
          {filteredTransactions.map((t) => {
            const category = categories.find((c) => c.id === t.categoryId);
            const isIncome = t.type === "income";
            const isTransfer = t.type === "transfer";
            const fromWallet = wallets.find((w) => w.id === t.walletId);
            const toWallet = wallets.find((w) => w.id === t.toWalletId);

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onEditTransaction?.(t)}
                className="w-full flex items-center justify-between rounded-2xl p-3 text-left transition-colors hover:bg-slate-50 active:scale-[0.99] cursor-pointer"
              >
                {/* Icon + Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    {isTransfer ? (
                      <ArrowLeftRight className="h-5 w-5 text-slate-700" strokeWidth={2} />
                    ) : (
                      <CategoryIcon
                        icon={category?.icon ?? "Package"}
                        color="#0F172A"
                        className="h-5 w-5"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {isTransfer
                        ? t.note || "Pindah Uang"
                        : t.note || category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isTransfer
                        ? `${fromWallet?.name ?? "Dompet"} → ${toWallet?.name ?? "Dompet"} · ${t.date}`
                        : `${category?.name || "Kategori"} · ${t.date}`}
                    </p>
                  </div>
                </div>

                {/* Amount (Clean Monochrome) */}
                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <span className="text-sm font-bold tabular-nums tracking-tight text-slate-900">
                    {isIncome ? "+" : isTransfer ? "" : "-"}{formatCurrency(t.amount)}
                  </span>
                  {isIncome ? (
                    <ArrowDownLeft className="h-3.5 w-3.5 text-slate-500" />
                  ) : isTransfer ? (
                    <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
