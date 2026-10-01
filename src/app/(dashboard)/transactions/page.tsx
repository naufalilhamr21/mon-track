"use client";

import { useState, useMemo } from "react";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useWalletStore } from "@/stores/wallet-store";
import { groupTransactionsByDate } from "@/lib/calculations/transaction-calculations";
import { formatCurrency, getRelativeDayLabel } from "@/lib/utils";
import { Search, X, SlidersHorizontal, Receipt, ArrowLeftRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";

function dispatchEditTransaction(transaction: Transaction) {
  window.dispatchEvent(new CustomEvent("moneta:edit-transaction", { detail: transaction }));
  window.dispatchEvent(new CustomEvent("montrack:edit-transaction", { detail: transaction }));
  window.dispatchEvent(new CustomEvent("montrac:edit-transaction", { detail: transaction }));
}

type TypeFilter = "all" | "expense" | "income" | "transfer";

export default function TransactionsPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterType, setFilterType] = useState<TypeFilter>("all");
  const [filterWallet, setFilterWallet] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = transactions;

    if (filterType !== "all") {
      result = result.filter((t) => {
        if (filterType === "expense") return t.type === "expense" || !t.type;
        return t.type === filterType;
      });
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return t.note?.toLowerCase().includes(q) || cat?.name.toLowerCase().includes(q);
      });
    }

    if (filterCategory) {
      result = result.filter((t) => t.categoryId === filterCategory);
    }

    if (filterWallet) {
      result = result.filter((t) => t.walletId === filterWallet || t.toWalletId === filterWallet);
    }

    return result;
  }, [transactions, search, filterCategory, filterType, filterWallet, categories]);

  const grouped = groupTransactionsByDate(filtered);
  const hasActiveFilter = filterCategory || filterWallet || search || filterType !== "all";

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Aktivitas</h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            {filtered.length} transaksi tercatat
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer",
            hasActiveFilter
              ? "aurora-glass-active shadow-xs"
              : "border-slate-200 bg-white text-slate-500 hover:border-slate-400 hover:text-slate-800"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          {hasActiveFilter ? "Filter Aktif" : "Filter"}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-3">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari catatan atau kategori..."
          className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none transition-all shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Type Filter Tabs ── */}
      <div className="flex gap-2 mb-3">
        {([
          { key: "all", label: "Semua" },
          { key: "expense", label: "Pengeluaran" },
          { key: "income", label: "Pemasukan" },
          { key: "transfer", label: "Pindah Uang" },
        ] as { key: TypeFilter; label: string }[]).map(({ key, label }) => {
          const active = filterType === key;
          return (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={cn(
                "flex-1 rounded-full border py-2 text-xs font-bold transition-all cursor-pointer active:scale-95",
                active
                  ? "aurora-glass-active shadow-xs"
                  : "bg-white text-slate-500 border-slate-200/80 hover:bg-slate-50"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Expanded Filters ── */}
      {showFilters && (
        <div className="mb-4 fun-card p-4 space-y-3">
          {/* Category Filter */}
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Kategori
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilterCategory("")}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                  !filterCategory
                    ? "aurora-glass-active shadow-xs"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                    filterCategory === cat.id
                      ? "aurora-glass-active shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <CategoryIcon
                    icon={cat.icon}
                    color={filterCategory === cat.id ? "#FFFFFF" : "#0F172A"}
                    className="h-3.5 w-3.5"
                  />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Filter */}
          {wallets.length > 0 && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Dompet / Rekening
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterWallet("")}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                    !filterWallet
                      ? "aurora-glass-active shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  Semua
                </button>
                {wallets.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setFilterWallet(w.id)}
                    className={cn(
                      "shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer",
                      filterWallet === w.id
                        ? "aurora-glass-active shadow-xs"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <CategoryIcon
                      icon={w.icon}
                      color={filterWallet === w.id ? "#FFFFFF" : "#0F172A"}
                      className="h-3.5 w-3.5"
                    />
                    <span>{w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilter && (
            <button
              onClick={() => {
                setFilterCategory("");
                setFilterWallet("");
                setSearch("");
                setFilterType("all");
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Hapus semua filter
            </button>
          )}
        </div>
      )}

      {/* ── Transaction List ── */}
      {grouped.length === 0 ? (
        <div className="fun-card mt-8 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            {hasActiveFilter ? <Search className="h-6 w-6" /> : <Receipt className="h-6 w-6" />}
          </div>
          <p className="text-sm font-bold text-slate-900">
            {hasActiveFilter ? "Transaksi tidak ditemukan" : "Belum ada transaksi"}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            {hasActiveFilter
              ? "Coba ubah filter atau kata kunci pencarian"
              : "Catat transaksi pertama dengan tombol + di kanan bawah"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map((group) => (
            <div key={group.date}>
              {/* Date Group Header */}
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {getRelativeDayLabel(group.date)}
                </span>
                <div className="flex items-center gap-2">
                  {group.incomeTotal > 0 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-slate-800 border border-slate-200">
                      +{formatCurrency(group.incomeTotal)}
                    </span>
                  )}
                  {group.expenseTotal > 0 && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-slate-600 border border-slate-200">
                      -{formatCurrency(group.expenseTotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transaction Cards */}
              <div className="fun-card overflow-hidden divide-y divide-slate-100">
                {group.transactions.map((t) => {
                  const cat = categories.find((c) => c.id === t.categoryId);
                  const wallet = wallets.find((w) => w.id === t.walletId);
                  const toWallet = wallets.find((w) => w.id === t.toWalletId);
                  const isIncome = t.type === "income";
                  const isTransfer = t.type === "transfer";

                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => dispatchEditTransaction(t)}
                      className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer active:scale-[0.99]"
                    >
                      {/* Icon + Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          {isTransfer ? (
                            <ArrowLeftRight className="h-5 w-5 text-slate-700" strokeWidth={2} />
                          ) : (
                            <CategoryIcon
                              icon={cat?.icon ?? "Package"}
                              color="#0F172A"
                              className="h-5 w-5"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-slate-900">
                            {isTransfer
                              ? t.note || "Pindah Uang"
                              : t.note || cat?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {isTransfer ? (
                              <span className="text-[10px] font-semibold text-slate-500">
                                {wallet?.name ?? "Dompet"} → {toWallet?.name ?? "Dompet"}
                              </span>
                            ) : (
                              <>
                                {cat && (
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {cat.name}
                                  </span>
                                )}
                                {wallet && (
                                  <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                                    · {wallet.name}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount (Monochrome) */}
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        <span className="text-sm font-bold tabular-nums tracking-tight text-slate-900">
                          {isIncome ? "+" : isTransfer ? "" : "-"}{formatCurrency(t.amount)}
                        </span>
                        {isTransfer && (
                          <ArrowLeftRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
