"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { House, ReceiptText, BarChart3, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  onAddExpense: () => void;
}

const navItems = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/transactions", label: "Aktivitas", icon: ReceiptText },
  { href: "/reports", label: "Analitik", icon: BarChart3 },
  { href: "/settings", label: "Akun", icon: Settings },
];

export function BottomNavigation({ onAddExpense }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      {/* SVG Gradient Definition for Active Nav Icons (userSpaceOnUse ensures all internal lines render) */}
      <svg width="0" height="0" className="absolute pointer-events-none opacity-0" aria-hidden="true">
        <defs>
          <linearGradient
            id="aurora-nav-gradient"
            gradientUnits="userSpaceOnUse"
            x1="2"
            y1="2"
            x2="22"
            y2="22"
          >
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="45%" stopColor="#afd4dbff" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Island Navigation Dock (Center-positioned, compact pill) */}
      <nav
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex h-[58px] items-center justify-around gap-1.5 px-3.5 py-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-xl shadow-slate-900/5 min-w-[236px]">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>

      {/* Separate Glass Aurora Gradient FAB (Elevated higher, larger size for superior one-thumb ergonomics) */}
      <div
        className="fixed right-4 bottom-7 z-40 pointer-events-auto"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <button
          type="button"
          onClick={onAddExpense}
          className="group relative flex h-[62px] w-[62px] cursor-pointer items-center justify-center rounded-full overflow-hidden backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/25"
          style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.92) 0%, rgba(81, 197, 247, 0.85) 40%, rgba(68, 225, 204, 0.85) 85%, rgba(52, 211, 153, 0.92) 100%)",
            border: "1.5px solid rgba(255, 255, 255, 0.7)",
            boxShadow:
              "inset 0 1.5px 3px 0 rgba(255, 255, 255, 0.85), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 0 12px 0 rgba(255, 255, 255, 0.25)",
          }}
          aria-label="Tambah transaksi"
          id="add-expense-fab"
        >
          <Plus className="relative z-10 h-8 w-8 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" strokeWidth={2.85} />
        </button>
      </div>
    </>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 active:scale-90",
        isActive
          ? "bg-slate-100/70"
          : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
      )}
      aria-label={label}
      title={label}
    >
      <Icon
        className={cn("h-6 w-6 transition-all", isActive && "drop-shadow-xs")}
        strokeWidth={isActive ? 2.3 : 1.95}
        style={isActive ? { stroke: "url(#aurora-nav-gradient)" } : undefined}
      />
    </Link>
  );
}

