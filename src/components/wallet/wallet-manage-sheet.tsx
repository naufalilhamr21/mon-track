"use client";

import { useState } from "react";
import { X, Check, Trash2 } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { CategoryIcon } from "@/components/ui/category-icon";
import { cn, generateId, formatAmountInput, parseAmountInput } from "@/lib/utils";
import type { Wallet, WalletType } from "@/types/wallet";
import { WALLET_TYPE_LABELS } from "@/types/wallet";
import { useSession } from "next-auth/react";

interface WalletManageSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editWallet?: Wallet | null;
  onSuccess?: () => void;
}

const WALLET_ICONS = [
  { icon: "Wallet", label: "Dompet" },
  { icon: "Building2", label: "Bank" },
  { icon: "Smartphone", label: "E-Wallet" },
  { icon: "CreditCard", label: "Kartu" },
  { icon: "PiggyBank", label: "Tabungan" },
  { icon: "Landmark", label: "Investasi" },
  { icon: "Briefcase", label: "Bisnis" },
  { icon: "Package", label: "Lainnya" },
];

const WALLET_TYPES: WalletType[] = ["cash", "bank", "ewallet", "credit", "savings", "other"];

export function WalletManageSheet({
  open,
  onOpenChange,
  editWallet,
  onSuccess,
}: WalletManageSheetProps) {
  if (!open) return null;

  return (
    <WalletManageModal
      key={editWallet?.id || "new"}
      onOpenChange={onOpenChange}
      editWallet={editWallet}
      onSuccess={onSuccess}
    />
  );
}

function WalletManageModal({
  onOpenChange,
  editWallet,
  onSuccess,
}: {
  onOpenChange: (open: boolean) => void;
  editWallet?: Wallet | null;
  onSuccess?: () => void;
}) {
  const { data: session } = useSession();
  const userIdentifier = session?.user?.email || session?.user?.id;
  const isEditing = !!editWallet;
  const { addWallet, updateWallet, deleteWallet } = useWalletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state initialized directly from props
  const [name, setName] = useState(editWallet?.name || "");
  const [type, setType] = useState<WalletType>(editWallet?.type || "cash");
  const [initialBalanceRaw, setInitialBalanceRaw] = useState(
    editWallet && editWallet.initialBalance > 0
      ? formatAmountInput(editWallet.initialBalance)
      : ""
  );
  const color = editWallet?.color || "#0F172A";
  const [icon, setIcon] = useState(editWallet?.icon || "Wallet");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const initialBalance = parseAmountInput(initialBalanceRaw);

      if (isEditing && editWallet) {
        await updateWallet(
          editWallet.id,
          { name: name.trim(), type, initialBalance, color, icon },
          userIdentifier
        );
      } else {
        await addWallet(
          {
            id: generateId(),
            name: name.trim(),
            type,
            initialBalance,
            color,
            icon,
            isDefault: false,
            createdAt: now,
            updatedAt: now,
          },
          userIdentifier
        );
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save wallet:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editWallet) return;
    setIsSubmitting(true);
    try {
      await deleteWallet(editWallet.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete wallet:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="animate-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="animate-slide-up absolute bottom-0 left-0 right-0 max-h-[92dvh] overflow-y-auto bg-white shadow-2xl"
        style={{
          borderRadius: "1.75rem 1.75rem 0 0",
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            {isEditing ? "Edit Dompet" : "Tambah Dompet"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Live Preview Card */}
          <div className="flex items-center gap-3.5 rounded-2xl p-4 transition-all border border-slate-200/80 bg-slate-50">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white aurora-glass-active shadow-xs">
              <CategoryIcon icon={icon} color="#FFFFFF" className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">
                {name || "Nama Dompet"}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {WALLET_TYPE_LABELS[type]}
              </p>
              {initialBalanceRaw && (
                <p className="text-xs font-bold text-slate-600 mt-0.5">
                  Saldo Awal: Rp {initialBalanceRaw}
                </p>
              )}
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Ikon Dompet
            </label>
            <div className="grid grid-cols-4 gap-2">
              {WALLET_ICONS.map(({ icon: i, label }) => {
                const active = icon === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 px-2 border transition-all cursor-pointer active:scale-95",
                      active
                        ? "aurora-glass-active shadow-xs text-white"
                        : "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-600"
                    )}
                    title={label}
                  >
                    <CategoryIcon icon={i} color={active ? "#FFFFFF" : "#0F172A"} className="h-5 w-5" />
                    <span className={cn("text-[10px] font-semibold truncate max-w-full", active ? "text-white" : "text-slate-600")}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet Name */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Nama Dompet / Rekening
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="BCA, Mandiri, GoPay, Dompet Harian..."
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Initial Balance */}
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Saldo Awal
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-4 transition-all focus-within:bg-white focus-within:border-slate-900">
              <span className="text-sm font-bold text-slate-400 shrink-0">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={initialBalanceRaw}
                onChange={(e) =>
                  setInitialBalanceRaw(
                    e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  )
                }
                placeholder="0"
                className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Wallet Type */}
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Tipe Dompet
            </label>
            <div className="flex flex-wrap gap-2">
              {WALLET_TYPES.map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                      active
                        ? "aurora-glass-active shadow-xs"
                        : "bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50"
                    )}
                  >
                    {WALLET_TYPE_LABELS[t]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className={cn(
              "w-full h-[52px] rounded-full py-3.5 text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed",
              isSubmitting || !name.trim()
                ? "bg-slate-100 text-slate-400"
                : "aurora-glass-active hover:opacity-95 active:scale-[0.98] shadow-md shadow-sky-500/20"
            )}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
                ? "Simpan Perubahan"
                : "Tambah Dompet"}
          </button>

          {/* Delete Button (Edit Only) */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-full border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:border-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Hapus Dompet
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-bold text-slate-800 text-center">
                Yakin hapus dompet ini? Riwayat transaksi tetap tersimpan.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
