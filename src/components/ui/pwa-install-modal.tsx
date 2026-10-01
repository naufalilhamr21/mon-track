"use client";

import { usePwaStore } from "@/stores/pwa-store";
import { X, Share, PlusSquare } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSheetDragDismiss } from "@/hooks/use-sheet-drag-dismiss";

export function PwaInstallModal() {
  const showIOSModal = usePwaStore((s) => s.showIOSModal);
  const setShowIOSModal = usePwaStore((s) => s.setShowIOSModal);
  const { y, dragHeaderProps } = useSheetDragDismiss(() => setShowIOSModal(false));

  return (
    <AnimatePresence>
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowIOSModal(false)}
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg mx-auto max-h-[88dvh] overflow-y-auto overscroll-contain rounded-t-3xl border-t border-slate-100 bg-white px-6 pt-3 pb-8 shadow-2xl"
            style={{
              y,
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2.5rem)",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-y",
            }}
          >
            {/* Draggable Header Area */}
            <div {...dragHeaderProps} className="cursor-grab active:cursor-grabbing">
              {/* Handle Bar (Decorative bar) */}
              <div className="flex justify-center py-2 w-full">
                <div className="h-1.5 w-12 rounded-full bg-slate-200 hover:bg-slate-300 transition-colors" />
              </div>

              {/* Header with App Logo */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 rounded-2xl overflow-hidden shadow-md">
                    <Image
                      src="/icons/montrack-logo.jpg"
                      alt="MonTrack Logo"
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0F172A]">
                      Akses di Layar Utama
                    </h3>
                    <p className="text-xs font-medium text-slate-400">
                      Pasang aplikasi tanpa perlu buka browser
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                  1
                </div>
                <div className="text-xs text-slate-600">
                  Tap ikon <strong>Bagikan / Share</strong>{" "}
                  <Share className="inline h-3.5 w-3.5 text-slate-900 align-text-bottom" />{" "}
                  atau <strong>Menu Titik Tiga (⋮)</strong> pada bilah menu browser.
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                  2
                </div>
                <div className="text-xs text-slate-600">
                  Gulir ke bawah dan pilih opsi{" "}
                  <strong>&ldquo;Tambah ke Layar Utama&rdquo;</strong> (
                  <PlusSquare className="inline h-3.5 w-3.5 text-slate-900 align-text-bottom" />
                  ).
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                  3
                </div>
                <div className="text-xs text-slate-600">
                  Tap <strong>&ldquo;Tambah&rdquo; (Add)</strong> di pojok kanan atas. Icon aplikasi akan langsung muncul di HP Anda!
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full h-[52px] rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-black active:scale-[0.98] transition-all cursor-pointer"
            >
              Mengerti
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
