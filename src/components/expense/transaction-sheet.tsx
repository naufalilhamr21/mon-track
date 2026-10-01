"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Trash2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, type TransactionFormValues } from "@/schemas/transaction-schema";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useSettingsStore } from "@/stores/settings-store";
import { AmountInput } from "./amount-input";
import { CategoryPicker } from "./category-picker";
import { cn, getToday, generateId } from "@/lib/utils";
import { useSession } from "next-auth/react";
import type { Transaction, TransactionType } from "@/types/transaction";
import type { Wallet } from "@/types/wallet";
import { CategoryIcon } from "@/components/ui/category-icon";

interface TransactionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editTransaction?: Transaction | null;
}

export function TransactionSheet({
  open,
  onOpenChange,
  onSuccess,
  editTransaction,
}: TransactionSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <TransactionSheetModal
          onOpenChange={onOpenChange}
          onSuccess={onSuccess}
          editTransaction={editTransaction}
        />
      )}
    </AnimatePresence>
  );
}

function TransactionSheetModal({
  onOpenChange,
  onSuccess,
  editTransaction,
}: {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editTransaction?: Transaction | null;
}) {
  const isEditing = !!editTransaction;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const updateTransaction = useTransactionStore((s) => s.updateTransaction);
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);
  const settings = useSettingsStore((s) => s.settings);
  const { data: session } = useSession();

  const getDefaultWalletForType = (type: TransactionType) => {
    if (type === "income" && settings.defaultIncomeWalletId) {
      const found = wallets.find((w) => w.id === settings.defaultIncomeWalletId);
      if (found) return found;
    }
    if (type === "expense" && settings.defaultExpenseWalletId) {
      const found = wallets.find((w) => w.id === settings.defaultExpenseWalletId);
      if (found) return found;
    }
    return wallets.find((w) => w.isDefault) ?? wallets[0];
  };

  const getInitialValues = (): TransactionFormValues => {
    const initialType = editTransaction?.type ?? "expense";
    const initialWallet = getDefaultWalletForType(initialType);
    const initialToWallet =
      editTransaction?.toWalletId ??
      (wallets.find((w) => w.id !== (editTransaction?.walletId ?? initialWallet?.id))?.id || "");

    return {
      type: initialType,
      amount: editTransaction?.amount ?? 0,
      categoryId: editTransaction?.categoryId ?? "",
      walletId: editTransaction?.walletId ?? initialWallet?.id ?? "",
      toWalletId: initialToWallet,
      note: editTransaction?.note ?? "",
      date: editTransaction?.date ?? getToday(),
      paymentMethod: editTransaction?.paymentMethod ?? undefined,
    };
  };

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getInitialValues(),
  });

  const txType = form.watch("type") as TransactionType;
  const amount = form.watch("amount");
  const walletId = form.watch("walletId");
  const toWalletId = form.watch("toWalletId");

  useEffect(() => {
    form.reset(getInitialValues());
    setShowDeleteConfirm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTransaction]);

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === "both"
  );

  useEffect(() => {
    if (txType !== "transfer") {
      const currentCategoryId = form.getValues("categoryId");
      const isCompatible = filteredCategories.some((c) => c.id === currentCategoryId);
      if (!isCompatible && currentCategoryId) form.setValue("categoryId", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txType]);

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const userIdentifier = session?.user?.email || session?.user?.id || "local-user";
      if (isEditing && editTransaction) {
        await updateTransaction(
          editTransaction.id,
          {
            amount: data.amount,
            type: data.type,
            categoryId: data.type === "transfer" ? "" : data.categoryId,
            walletId: data.walletId,
            toWalletId: data.type === "transfer" ? data.toWalletId : undefined,
            note: data.note || undefined,
            date: data.date,
            paymentMethod: data.paymentMethod,
            updatedAt: now,
          },
          userIdentifier
        );
      } else {
        await addTransaction(
          {
            id: generateId(),
            amount: data.amount,
            type: data.type,
            categoryId: data.type === "transfer" ? "" : data.categoryId,
            walletId: data.walletId,
            toWalletId: data.type === "transfer" ? data.toWalletId : undefined,
            note: data.note || undefined,
            date: data.date,
            paymentMethod: data.paymentMethod,
            createdAt: now,
            updatedAt: now,
          },
          userIdentifier
        );
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editTransaction) return;
    setIsSubmitting(true);
    try {
      await deleteTransaction(editTransaction.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const isExpense = txType === "expense";
  const isIncome = txType === "income";
  const isTransfer = txType === "transfer";

  const sheetTitle = isEditing
    ? isTransfer
      ? "Ubah Pindah Uang"
      : "Ubah Transaksi"
    : isExpense
    ? "Tambah Pengeluaran"
    : isIncome
    ? "Tambah Pemasukan"
    : "Pindah Uang";

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <motion.div
        drag="y"
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
        className="relative z-10 w-full max-h-[94dvh] overflow-y-auto bg-white shadow-2xl rounded-t-[32px] px-1 pb-8 touch-pan-y"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
        }}
      >
        {/* Handle (Drag area) */}
        <div className="flex justify-center py-2.5 cursor-grab active:cursor-grabbing">
          <div className="h-1.5 w-12 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-base font-bold text-slate-900">{sheetTitle}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Type Switcher (3 Tabs: Pengeluaran, Pemasukan, Pindah Uang) ── */}
        <div className="px-5 pb-3">
          <div className="flex rounded-full overflow-hidden bg-slate-100 p-1 gap-1">
            {([
              { key: "expense", label: "Pengeluaran" },
              { key: "income", label: "Pemasukan" },
              { key: "transfer", label: "Pindah Uang" },
            ] as { key: TransactionType; label: string }[]).map(({ key, label }) => {
              const active = txType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    form.setValue("type", key);
                    if (!isEditing) {
                      if (key === "transfer") {
                        const currentSource = form.getValues("walletId") || wallets[0]?.id || "";
                        const nextDest = wallets.find((w) => w.id !== currentSource)?.id || "";
                        form.setValue("walletId", currentSource);
                        form.setValue("toWalletId", nextDest, { shouldValidate: true });
                        form.setValue("categoryId", "");
                      } else {
                        const targetWallet = getDefaultWalletForType(key);
                        if (targetWallet) {
                          form.setValue("walletId", targetWallet.id);
                        }
                      }
                    }
                  }}
                  className={cn(
                    "flex-1 rounded-full py-2 text-xs font-bold transition-all cursor-pointer active:scale-95",
                    active
                      ? "aurora-glass-active shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-5 pb-5 space-y-4">
          {/* Amount Input */}
          <AmountInput
            value={amount}
            onChange={(val) => form.setValue("amount", val, { shouldValidate: true })}
            error={form.formState.errors.amount?.message}
            type={txType}
          />

          {/* Wallet Selectors */}
          {isTransfer ? (
            <div className="space-y-3.5">
              {/* Source Wallet */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Dari Dompet (Asal)
                </p>
                <div className="flex flex-wrap gap-2">
                  {wallets.map((w: Wallet) => {
                    const active = walletId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          form.setValue("walletId", w.id, { shouldValidate: true });
                          if (toWalletId === w.id) {
                            const other = wallets.find((otherW) => otherW.id !== w.id);
                            if (other) form.setValue("toWalletId", other.id, { shouldValidate: true });
                          }
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
                          active
                            ? "aurora-glass-active shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <CategoryIcon
                          icon={w.icon}
                          color={active ? "#FFFFFF" : "#0F172A"}
                          className="h-3.5 w-3.5"
                        />
                        {w.name}
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.walletId && (
                  <p className="mt-1.5 text-xs font-bold text-red-500">
                    {form.formState.errors.walletId.message}
                  </p>
                )}
              </div>

              {/* Destination Wallet */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Ke Dompet (Tujuan)
                </p>
                <div className="flex flex-wrap gap-2">
                  {wallets.map((w: Wallet) => {
                    const active = toWalletId === w.id;
                    const isSame = walletId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        disabled={isSame}
                        onClick={() =>
                          form.setValue("toWalletId", w.id, { shouldValidate: true })
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed",
                          active
                            ? "aurora-glass-active shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <CategoryIcon
                          icon={w.icon}
                          color={active ? "#FFFFFF" : "#0F172A"}
                          className="h-3.5 w-3.5"
                        />
                        {w.name}
                        {isSame && <span className="text-[9px] font-normal text-slate-400">(Asal)</span>}
                      </button>
                    );
                  })}
                </div>
                {form.formState.errors.toWalletId && (
                  <p className="mt-1.5 text-xs font-bold text-red-500">
                    {form.formState.errors.toWalletId.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            wallets.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isExpense ? "Dari Dompet" : "Ke Dompet"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {wallets.map((w: Wallet) => {
                    const active = walletId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() =>
                          form.setValue("walletId", w.id, { shouldValidate: true })
                        }
                        className={cn(
                          "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
                          active
                            ? "aurora-glass-active shadow-xs"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <CategoryIcon
                          icon={w.icon}
                          color={active ? "#FFFFFF" : "#0F172A"}
                          className="h-3.5 w-3.5"
                        />
                        {w.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}

          {/* Category (Expense and Income only) */}
          {!isTransfer && (
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Kategori
              </p>
              <CategoryPicker
                categories={filteredCategories}
                selected={form.watch("categoryId")}
                onSelect={(id) =>
                  form.setValue("categoryId", id, { shouldValidate: true })
                }
              />
              {form.formState.errors.categoryId && (
                <p className="mt-1.5 text-xs font-bold text-slate-900">
                  {form.formState.errors.categoryId.message}
                </p>
              )}
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <FileText className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
              Catatan
              <span className="font-normal normal-case text-slate-400">(opsional)</span>
            </label>
            <input
              {...form.register("note")}
              type="text"
              placeholder={
                isTransfer
                  ? "Tarik tunai ATM, isi saldo GoPay, tabungan..."
                  : "Makan siang, bensin, belanja..."
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
              Tanggal
            </label>
            <input
              {...form.register("date")}
              type="date"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm font-semibold text-slate-900 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={isSubmitting || amount === 0}
            className={cn(
              "w-full h-[52px] rounded-full py-3.5 text-sm font-bold transition-all cursor-pointer disabled:cursor-not-allowed",
              isSubmitting || amount === 0
                ? "bg-slate-100 text-slate-400"
                : "aurora-glass-active hover:opacity-95 active:scale-[0.98] shadow-md shadow-sky-500/20"
            )}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditing
              ? "Simpan Perubahan"
              : isTransfer
              ? "Pindah Uang"
              : "Simpan Transaksi"}
          </button>

          {/* Delete (Edit Mode Only) */}
          {isEditing && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full rounded-full border border-slate-200 py-3 text-xs font-bold text-slate-500 hover:border-slate-900 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Hapus Transaksi
            </button>
          )}

          {isEditing && showDeleteConfirm && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-bold text-center text-slate-900">
                Yakin ingin menghapus transaksi ini?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  Hapus
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
