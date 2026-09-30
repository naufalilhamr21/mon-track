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
        <div className="flex h-14 items-center justify-around gap-1 px-3 py-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-full shadow-xl shadow-slate-900/5 min-w-[220px]">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              {...item}
              isActive={pathname === item.href}
            />
          ))}
        </div>
      </nav>

      {/* Separate Luminous Blue-Cyan-Green Gradient FAB (Bottom-Right) */}
      <div
        className="fixed right-4 bottom-4 z-40 pointer-events-auto"
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <button
          type="button"
          onClick={onAddExpense}
          className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border border-white/40 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #51c5f7ff 40%, #44e1ccff 85%, #34D399 100%)",
          }}
          aria-label="Tambah transaksi"
          id="add-expense-fab"
        >
          <Plus className="h-7 w-7 text-white drop-shadow-xs" strokeWidth={2.75} />
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
          ? "bg-slate-100/60"
          : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
      )}
      aria-label={label}
      title={label}
    >
      <Icon
        className={cn("h-5 w-5 transition-all", isActive && "drop-shadow-xs")}
        strokeWidth={isActive ? 2.2 : 1.9}
        style={isActive ? { stroke: "url(#aurora-nav-gradient)" } : undefined}
      />
    </Link>
  );
}

