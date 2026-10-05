"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";
import { TransactionSheet } from "@/components/expense/transaction-sheet";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useWalletStore } from "@/stores/wallet-store";
import { Toast, useToast } from "@/components/ui/toast";
import { initializeDatabase } from "@/lib/db";
import { syncEngine } from "@/lib/sync-engine";
import type { Transaction } from "@/types/transaction";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [isReady, setIsReady] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadWallets = useWalletStore((s) => s.loadWallets);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      const userIdentifier = session?.user?.email || session?.user?.id;

      async function init() {
        try {
          await initializeDatabase();
          await Promise.all([
            loadTransactions(),
            loadCategories(),
            loadSettings(),
            loadWallets(),
          ]);

          // Background Auto-Sync to/from Supabase
          if (navigator.onLine) {
            syncEngine.syncAll(userIdentifier).then(() => {
              Promise.all([
                loadTransactions(),
                loadCategories(),
                loadSettings(),
                loadWallets(),
              ]);
            });
          }
        } catch (error) {
          console.error("Failed to load initial data:", error);
        } finally {
          setIsReady(true);
        }
      }
      init();

      // Listen for reconnect event
      const handleOnline = () => {
        syncEngine.syncAll(userIdentifier).then(() => {
          Promise.all([
            loadTransactions(),
            loadCategories(),
            loadSettings(),
            loadWallets(),
          ]);
        });
      };

      window.addEventListener("online", handleOnline);
      return () => {
        window.removeEventListener("online", handleOnline);
      };
    }
  }, [status, session, loadTransactions, loadCategories, loadSettings, loadWallets, router]);

  // Expose edit function globally via event for cross-page use
  useEffect(() => {
    const handleEditEvent = (e: CustomEvent<Transaction>) => {
      setEditTransaction(e.detail);
      setTransactionOpen(true);
    };
    window.addEventListener("moneta:edit-transaction", handleEditEvent as EventListener);
    window.addEventListener("montrack:edit-transaction", handleEditEvent as EventListener);
    window.addEventListener("montrac:edit-transaction", handleEditEvent as EventListener);
    return () => {
      window.removeEventListener("moneta:edit-transaction", handleEditEvent as EventListener);
      window.removeEventListener("montrack:edit-transaction", handleEditEvent as EventListener);
      window.removeEventListener("montrac:edit-transaction", handleEditEvent as EventListener);
    };
  }, []);

  const handleFabPress = () => {
    setEditTransaction(null);
    setTransactionOpen(true);
  };

  if (status === "loading" || !isReady) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-aurora-header">
        <div className="text-center">
          {/* Logo container with aurora glow */}
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-[1.5rem] bg-blue-300 opacity-30 blur-lg" />
            <Image
              src="/icons/moneta-logo.jpg"
              alt="Moneta"
              width={80}
              height={80}
              className="relative rounded-[1.5rem] object-cover animate-float"
              style={{ boxShadow: "0 8px 24px rgba(37,99,235,0.2)" }}
              priority
            />
          </div>
          <p className="text-base font-black text-slate-800 tracking-tight mb-4">
            Moneta
          </p>
          <div
            className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "#2563EB", borderTopColor: "transparent" }}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="safe-bottom min-h-dvh pb-4">{children}</main>
      <BottomNavigation onAddExpense={handleFabPress} />
      <TransactionSheet
        open={transactionOpen}
        onOpenChange={(v) => {
          setTransactionOpen(v);
          if (!v) setEditTransaction(null);
        }}
        editTransaction={editTransaction}
        onSuccess={() => {
          const msg = editTransaction ? "Transaksi berhasil diperbarui" : "Transaksi tersimpan";
          showToast(msg, "success");
          loadTransactions();
          loadWallets();
        }}
      />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </>
  );
}
