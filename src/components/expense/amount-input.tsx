"use client";

import { useRef, useEffect } from "react";
import { formatAmountInput, parseAmountInput, cn } from "@/lib/utils";
import type { TransactionType } from "@/types/transaction";

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
  type?: TransactionType;
}

export function AmountInput({ value, onChange, error, type = "expense" }: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseAmountInput(e.target.value));
  };

  const formatted = value > 0 ? formatAmountInput(value) : "";

  const fontSizeClass =
    formatted.length > 13 ? "text-2xl"
    : formatted.length > 10 ? "text-3xl"
    : formatted.length > 7  ? "text-4xl"
    : "text-5xl";

  const isIncome = type === "income";

  return (
    <div className="w-full rounded-2xl py-5 px-4 text-center border bg-slate-50 border-slate-100 transition-all">
      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {isIncome ? "Nominal Pemasukan" : "Nominal Pengeluaran"}
      </p>
      <div className="flex w-full items-baseline justify-center gap-1.5">
        <span
          className={cn(
            "text-xl font-bold shrink-0",
            value === 0 ? "text-slate-300" : "text-slate-900"
          )}
        >
          Rp
        </span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={formatted}
          onChange={handleChange}
          placeholder="0"
          className={cn(
            "w-full max-w-[260px] border-none bg-transparent text-center font-extrabold tabular-nums tracking-tight focus:outline-none",
            fontSizeClass,
            value === 0
              ? "text-slate-300 placeholder:text-slate-300"
              : "text-slate-900"
          )}
          autoComplete="off"
        />
      </div>
      {value === 0 && (
        <p className="mt-1.5 text-[10px] font-medium text-slate-400">
          Ketuk untuk memasukkan nominal
        </p>
      )}
      {error && <p className="mt-1.5 text-xs font-bold text-slate-900 bg-slate-200/70 rounded-full px-3 py-0.5 inline-block">{error}</p>}
    </div>
  );
}
