"use client";

import { useState } from "react";
import { Plus, WalletCards } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { WalletManageSheet } from "@/components/wallet/wallet-manage-sheet";
import { formatCurrency, cn } from "@/lib/utils";
import type { Wallet as WalletType } from "@/types/wallet";

export function WalletCarousel() {
  const wallets = useWalletStore((s) => s.wallets);
  const getWalletBalance = useWalletStore((s) => s.getWalletBalance);
  const getTotalBalance = useWalletStore((s) => s.getTotalBalance);
  const transactions = useTransactionStore((s) => s.transactions);

  const [addOpen, setAddOpen] = useState(false);
  const [editWallet, setEditWallet] = useState<WalletType | null>(null);

  const totalBalance = getTotalBalance(transactions);

  if (wallets.length === 0) return null;

  return (
    <>
      {/* Total Balance — Clean White Card */}
      <div className="fun-card p-4.5 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <WalletCards className="h-3.5 w-3.5 text-slate-500" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Aset / Dompet
              </p>
            </div>
            <p className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors active:scale-95 cursor-pointer"
            aria-label="Tambah dompet"
            title="Tambah dompet"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Wallet chips — Monochrome clean cards */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
        {wallets.map((wallet) => {
          const balance = getWalletBalance(wallet.id, transactions);
          const isNegative = balance < 0;

          return (
            <button
              key={wallet.id}
              type="button"
              onClick={() => setEditWallet(wallet)}
              className="group shrink-0 flex flex-col gap-2 rounded-2xl px-4 py-3 min-w-[8.5rem] bg-white transition-all hover:border-slate-400 active:scale-[0.98] border border-slate-200/80 cursor-pointer shadow-xs text-left"
            >
              <div className="flex items-center justify-between w-full">
                {/* Icon container */}
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                  <CategoryIcon icon={wallet.icon} color="#0F172A" className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium truncate max-w-[6.5rem] text-slate-500">
                  {wallet.name}
                </p>
                <p className={cn(
                  "text-sm font-bold tabular-nums",
                  isNegative ? "text-slate-500" : "text-slate-900"
                )}>
                  {isNegative ? "-" : ""}{formatCurrency(Math.abs(balance))}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <WalletManageSheet open={addOpen} onOpenChange={setAddOpen} editWallet={null} />
      <WalletManageSheet
        open={!!editWallet}
        onOpenChange={(v) => { if (!v) setEditWallet(null); }}
        editWallet={editWallet}
      />
    </>
  );
}
