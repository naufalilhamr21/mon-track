"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Shield, Lock } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
      style={{
        background: "linear-gradient(135deg, #DCFCE7 0%, #F0FDF4 25%, #FFFFFF 50%, #F0F9FF 75%, #E0F2FE 100%)",
      }}
    >
      <div className="relative w-full max-w-sm">
        {/* Hero Branding */}
        <div className="text-center mb-8">
          {/* Logo container */}
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            <Image
              src="/icons/logo-baru.png"
              alt="MonTrack Logo"
              width={80}
              height={80}
              className="relative rounded-2xl object-contain shadow-md"
              priority
            />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
            MonTrack
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Personal Finance &amp; Multi-Wallet Tracker
          </p>
        </div>

        {/* Clean Login Card */}
        <div className="rounded-3xl p-6 mb-4 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5">
          <p className="text-center text-sm font-bold text-slate-800 mb-4">
            Masuk untuk mulai mencatat
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition-all hover:bg-slate-50 hover:border-slate-400 active:scale-95 disabled:opacity-60 cursor-pointer shadow-xs"
            id="google-login-button"
          >
            {!isLoading ? (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Masuk dengan Google</span>
              </>
            ) : (
              <>
                <div className="h-5 w-5 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin shrink-0" />
                <span>Menghubungkan...</span>
              </>
            )}
          </button>

          {/* Encryption assurance */}
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl p-3.5 bg-slate-50 border border-slate-200/70">
            <Shield className="h-4 w-4 text-slate-700 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Data terenkripsi &amp; privat
              </p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                Data keuangan disimpan secara lokal dan dienkripsi (End-to-End E2EE AES-GCM 256-bit) sebelum sinkronisasi cloud.
              </p>
            </div>
          </div>
        </div>

        {/* Footer badges */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
            <Lock className="h-3 w-3 text-slate-500" />
            <span>End-to-End Encrypted · Local-First</span>
          </div>
        </div>
      </div>
    </div>
  );
}
