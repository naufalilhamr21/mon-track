"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useSettingsStore } from "@/stores/settings-store";
import { useTransactionStore } from "@/stores/transaction-store";
import { useCategoryStore } from "@/stores/category-store";
import { useWalletStore } from "@/stores/wallet-store";
import { usePwaStore } from "@/stores/pwa-store";
import { db, initializeDatabase } from "@/lib/db";

import {
  LogOut,
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  ChevronRight,
  User,
  Cloud,
  RefreshCw,
  Smartphone,
  Database,
  Shield,
  WalletCards,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { syncEngine } from "@/lib/sync-engine";
import { PwaInstallModal } from "@/components/ui/pwa-install-modal";
import { DefaultWalletSheet } from "@/components/settings/default-wallet-sheet";
import { WALLET_TYPE_LABELS } from "@/types/wallet";

export default function SettingsPage() {
  const dragControls = useDragControls();
  const { data: session } = useSession();

  const settings = useSettingsStore((s) => s.settings);
  const setDefaultExpenseWallet = useSettingsStore((s) => s.setDefaultExpenseWallet);
  const setDefaultIncomeWallet = useSettingsStore((s) => s.setDefaultIncomeWallet);

  const transactions = useTransactionStore((s) => s.transactions);
  const categories = useCategoryStore((s) => s.categories);
  const wallets = useWalletStore((s) => s.wallets);
  const loadTransactions = useTransactionStore((s) => s.loadTransactions);
  const loadCategories = useCategoryStore((s) => s.loadCategories);
  const loadWallets = useWalletStore((s) => s.loadWallets);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  const promptInstall = usePwaStore((s) => s.promptInstall);
  const isStandalone = usePwaStore((s) => s.isStandalone);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [walletSheetType, setWalletSheetType] = useState<"expense" | "income" | null>(null);

  const defaultWallet = wallets.find((w) => w.isDefault) ?? wallets[0];
  const expenseWallet =
    wallets.find((w) => w.id === settings.defaultExpenseWalletId) ?? defaultWallet;
  const incomeWallet =
    wallets.find((w) => w.id === settings.defaultIncomeWalletId) ?? defaultWallet;

  const handleInstallClick = async () => {
    await promptInstall();
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    const userIdentifier = session?.user?.email || session?.user?.id;
    const result = await syncEngine.syncAll(userIdentifier);
    setIsSyncing(false);

    if (result.success) {
      await Promise.all([loadTransactions(), loadWallets(), loadCategories(), loadSettings()]);
      setImportStatus(
        `Berhasil disinkronkan (${result.count} data transaksi & dompet diproses)`
      );
    } else {
      setImportStatus(
        `Gagal sinkronisasi: ${result.error || "Cek koneksi internet"}`
      );
    }
  };

  const handleExportJSON = () => {
    const data = {
      schemaVersion: 2,
      application: "MonTrack" as const,
      exportedAt: new Date().toISOString(),
      wallets,
      categories,
      transactions,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `montrack-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (
          data.application !== "MonTrack" &&
          data.application !== "JagaJajan" &&
          data.application !== "MonTrac" &&
          data.application !== "MoneyTrack" &&
          data.application !== "IngatMiskin" &&
          data.application !== "Ingat Miskin"
        ) {
          setImportStatus("File bukan backup yang valid");
          return;
        }
        await db.transactions.clear();
        await db.categories.clear();
        await db.settings.clear();
        await db.wallets.clear();

        if (data.wallets?.length) await db.wallets.bulkPut(data.wallets);
        if (data.categories?.length) await db.categories.bulkPut(data.categories);
        if (data.transactions?.length) await db.transactions.bulkPut(data.transactions);
        if (data.settings) await db.settings.put(data.settings);

        await initializeDatabase();
        await Promise.all([
          loadTransactions(),
          loadWallets(),
          loadCategories(),
          loadSettings(),
        ]);
        setImportStatus("Data berhasil diimpor");
      } catch {
        setImportStatus("Gagal mengimpor data. File tidak valid.");
      }
    };
    input.click();
  };

  const handleExportCSV = () => {
    const headers = [
      "Date",
      "Type",
      "Amount",
      "Category",
      "Wallet",
      "Note",
      "Created At",
    ];
    const rows = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      const wallet = wallets.find((w) => w.id === t.walletId);
      return [
        t.date,
        t.type || "expense",
        t.amount.toString(),
        cat?.name ?? "Unknown",
        wallet?.name ?? "Dompet Tunai",
        t.note ?? "",
        t.createdAt,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `montrack-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = async () => {
    await db.transactions.clear();
    await db.categories.clear();
    await db.settings.clear();
    await db.wallets.clear();
    await initializeDatabase();
    await Promise.all([loadTransactions(), loadWallets(), loadCategories(), loadSettings()]);
    setShowClearConfirm(false);
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6 pb-24">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Akun</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">Kelola data dan preferensi</p>
      </div>

      {/* Profile Card */}
      <div className="fun-card mb-5 p-4 flex items-center gap-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl text-base font-extrabold text-white aurora-glass-active">
          {(session?.user?.name?.[0] ?? "U").toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold text-slate-900">
            {session?.user?.name ?? "Pengguna"}
          </div>
          <div className="truncate text-xs font-medium text-slate-400 mt-0.5">
            {session?.user?.email}
          </div>
        </div>
      </div>

      {/* ── Metode Pembayaran Default ── */}
      <SectionTitle icon={WalletCards}>Metode Pembayaran</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <SettingsRow
          icon={ArrowUpRight}
          label="Default Pengeluaran"
          sublabel={
            expenseWallet
              ? `${expenseWallet.name} • ${WALLET_TYPE_LABELS[expenseWallet.type] || expenseWallet.type}`
              : "Pilih dompet default"
          }
          onClick={() => setWalletSheetType("expense")}
        />
        <SettingsRow
          icon={ArrowDownLeft}
          label="Default Pemasukan"
          sublabel={
            incomeWallet
              ? `${incomeWallet.name} • ${WALLET_TYPE_LABELS[incomeWallet.type] || incomeWallet.type}`
              : "Pilih dompet default"
          }
          onClick={() => setWalletSheetType("income")}
        />
      </div>

      {/* ── Aplikasi ── */}
      <SectionTitle icon={Smartphone}>Aplikasi</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <button
          onClick={handleInstallClick}
          className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
          id="btn-install-a2hs"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <Smartphone className="h-5 w-5 text-slate-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900">Akses di Layar Utama</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">
              {isStandalone ? "Sudah terpasang di HP Anda" : "Pasang icon di home screen"}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* ── Akun ── */}
      <SectionTitle icon={User}>Akun</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
            <LogOut className="h-5 w-5 text-slate-700" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900">Keluar dari Akun</div>
            <div className="text-xs font-medium text-slate-400 mt-0.5">Kamu akan diarahkan ke halaman login</div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-300" />
        </button>
      </div>

      {/* ── Data & Backup ── */}
      <SectionTitle icon={Database}>Data &amp; Backup</SectionTitle>
      <div className="fun-card mb-5 overflow-hidden">
        <SettingsRow
          icon={isSyncing ? RefreshCw : Cloud}
          label={isSyncing ? "Menyinkronkan..." : "Sinkronisasi Cloud"}
          sublabel="Sync data ke server"
          onClick={handleManualSync}
        />
        <SettingsRow
          icon={Download}
          label="Ekspor JSON"
          sublabel="Simpan data sebagai file backup"
          onClick={handleExportJSON}
        />
        <SettingsRow
          icon={Upload}
          label="Impor JSON"
          sublabel="Pulihkan dari file backup"
          onClick={handleImportJSON}
        />
        <SettingsRow
          icon={FileSpreadsheet}
          label="Ekspor CSV"
          sublabel="Buka di Excel atau Google Sheets"
          onClick={handleExportCSV}
        />
        <SettingsRow
          icon={Trash2}
          label="Hapus semua data"
          sublabel="Hapus semua transaksi lokal"
          onClick={() => setShowClearConfirm(true)}
          destructive
        />
      </div>

      {importStatus && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-700" />
            <span className="text-sm font-bold text-slate-800">
              {importStatus}
            </span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Enkripsi & Privasi Info ── */}
      <div className="mb-5 rounded-2xl p-4 flex gap-3 border border-slate-200/80 bg-white">
        <Shield className="h-5 w-5 text-slate-800 shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <p className="text-sm font-bold text-slate-900 mb-0.5">
            Data terenkripsi &amp; aman
          </p>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Data Anda tersimpan di perangkat dan terenkripsi saat sinkronisasi ke cloud.
          </p>
        </div>
      </div>

      <p className="text-center text-xs font-semibold text-slate-400 mb-5">
        MonTrack v1.0
      </p>

      {/* Clear Data Bottom Sheet */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setShowClearConfirm(false)}
            />
            <motion.div
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90 || info.velocity.y > 250) {
                  setShowClearConfirm(false);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              className="relative z-10 w-full bg-white shadow-2xl rounded-t-3xl pb-8"
              style={{
                paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
              }}
            >
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex justify-center py-2.5 cursor-grab active:cursor-grabbing touch-none select-none w-full"
              >
                <div className="h-1.5 w-12 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors" />
              </div>
              <div className="px-6 pb-6">
                <div className="text-center mb-5">
                  <Trash2 className="mx-auto h-9 w-9 mb-2 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">Hapus semua data?</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Semua transaksi lokal akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 rounded-full border border-slate-200 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleClearData}
                    className="flex-1 rounded-full py-3 text-xs font-bold text-white bg-slate-900 hover:bg-black cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {walletSheetType && (
        <DefaultWalletSheet
          open={!!walletSheetType}
          onOpenChange={(open) => {
            if (!open) setWalletSheetType(null);
          }}
          type={walletSheetType}
          currentWalletId={
            walletSheetType === "expense"
              ? settings.defaultExpenseWalletId
              : settings.defaultIncomeWalletId
          }
          onSelect={async (walletId) => {
            const userIdentifier = session?.user?.email || session?.user?.id;
            if (walletSheetType === "expense") {
              await setDefaultExpenseWallet(walletId, userIdentifier);
            } else {
              await setDefaultIncomeWallet(walletId, userIdentifier);
            }
          }}
        />
      )}

      <PwaInstallModal />
    </div>
  );
}

function SectionTitle({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <h2 className="mb-2.5 px-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
      <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100">
        <Icon className="h-3 w-3 text-slate-700" />
      </div>
      {children}
    </h2>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  sublabel,
  onClick,
  destructive = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3.5 px-5 py-3.5 text-sm transition-colors hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-b-0"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
        <Icon className="h-4 w-4 text-slate-700" />
      </div>
      <div className="flex-1 text-left">
        <div className={cn("text-sm font-bold", destructive ? "text-slate-700" : "text-slate-900")}>
          {label}
        </div>
        {sublabel && (
          <div className="text-xs font-medium text-slate-400 mt-0.5">{sublabel}</div>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}
