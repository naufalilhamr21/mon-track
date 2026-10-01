"use client";

import { X, Check, WalletCards, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useWalletStore } from "@/stores/wallet-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { WALLET_TYPE_LABELS, type Wallet } from "@/types/wallet";
import { formatCurrency, cn } from "@/lib/utils";

interface DefaultWalletSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "expense" | "income";
  currentWalletId?: string;
  onSelect: (walletId: string) => Promise<void> | void;
}

export function DefaultWalletSheet({
  open,
  onOpenChange,
  type,
  currentWalletId,
  onSelect,
}: DefaultWalletSheetProps) {
  const dragControls = useDragControls();
  const wallets = useWalletStore((s) => s.wallets);
  const transactions = useTransactionStore((s) => s.transactions);
  const getWalletBalance = useWalletStore((s) => s.getWalletBalance);

  const isExpense = type === "expense";
  const title = isExpense
    ? "Dompet Default Pengeluaran"
    : "Dompet Default Pemasukan";
  const description = isExpense
    ? "Pilih dompet yang otomatis terpilih saat menambah pengeluaran."
    : "Pilih dompet yang otomatis terpilih saat menambah pemasukan.";

  // Fallback default wallet if currentWalletId is not explicitly set
  const fallbackDefaultId =
    wallets.find((w) => w.isDefault)?.id || wallets[0]?.id;
  const effectiveSelectedId = currentWalletId || fallbackDefaultId;

  const handleWalletSelect = async (walletId: string) => {
    await onSelect(walletId);
    onOpenChange(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => onOpenChange(false)}
          />

          {/* Bottom Sheet */}
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90 || info.velocity.y > 250) {
                onOpenChange(false);
              }
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-slate-100 bg-white px-6 pt-3 pb-8 shadow-2xl"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
          >
            {/* Handle (Drag area) */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex justify-center py-2 cursor-grab active:cursor-grabbing touch-none select-none w-full"
            >
              <div className="h-1.5 w-12 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  {isExpense ? (
                    <ArrowUpRight className="h-5 w-5 text-slate-800" strokeWidth={2.5} />
                  ) : (
                    <ArrowDownLeft className="h-5 w-5 text-slate-800" strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">{description}</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Wallets List */}
            <div className="mt-3 space-y-2">
              {wallets.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                  <WalletCards className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Belum ada dompet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Buat dompet terlebih dahulu di halaman Transaksi / Beranda.
                  </p>
                </div>
              ) : (
                wallets.map((wallet: Wallet) => {
                  const isSelected = effectiveSelectedId === wallet.id;
                  const balance = getWalletBalance(wallet.id, transactions);

                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => handleWalletSelect(wallet.id)}
                      className={cn(
                        "flex w-full items-center justify-between p-3.5 rounded-2xl border transition-all text-left cursor-pointer active:scale-[0.99]",
                        isSelected
                          ? "border-slate-900 bg-slate-50/80 shadow-xs"
                          : "border-slate-100 bg-white hover:bg-slate-50/60 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <CategoryIcon
                            icon={wallet.icon}
                            color="#0F172A"
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-bold text-slate-900">
                              {wallet.name}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-400 mt-0.5">
                            {WALLET_TYPE_LABELS[wallet.type] || wallet.type} &bull;{" "}
                            <span className="font-semibold text-slate-600 tabular-nums">
                              {formatCurrency(balance)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center pl-3">
                        {isSelected ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full text-white aurora-glass-active shadow-xs">
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full border border-slate-200" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
