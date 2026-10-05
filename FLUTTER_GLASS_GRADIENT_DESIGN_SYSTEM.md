# MonTrack — Flutter Glassmorphism & Aurora Gradient Design System Guide

Panduan implementasi lengkap untuk mengadopsi bahasa desain **Modern Pastel Aurora & Frosted Glassmorphism** dari web MonTrack ke aplikasi mobile **Flutter**.

---

## 1. Design Language & Konsep Visual

1. **Atmospheric Pastel Aurora**: Gradasi lembut di latar belakang atas (*Mint → Soft Blue → Sky Cyan*).
2. **Frosted Glass (Glassmorphism)**: Efek kaca semi-transparan buram menggunakan `BackdropFilter` + `ClipRRect` + border putih tipis.
3. **Luminous Aurora FAB**: Tombol aksi melayang dengan gradasi bercahaya dan bayangan lembut (*multi-layer glowing shadow*).
4. **Floating Island Navigation**: Dock navigasi bawah berbentuk kapsul melayang (*detached island*) dengan efek frosted glass.
5. **Clean Typography**: Menggunakan font modern **Plus Jakarta Sans**.

---

## 2. Setup Dependencies & Asset

Tambahkan package berikut ke `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  google_fonts: ^6.2.1
  lucide_icons: ^0.257.0 # atau iconsax_flutter / flutter_feather_icons
```

---

## 3. Design Tokens (Colors, Gradients & Shadows)

Buat file `lib/core/theme/app_colors.dart`:

```dart
import 'package:flutter/material.dart';

class AppColors {
  // ── Canvas & Surface ──
  static const Color background = Color(0xFFF8FAFC); // Slate 50
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceRaised = Color(0xFFF1F5F9);

  // ── Typography / Ink ──
  static const Color ink = Color(0xFF0F172A);          // Slate 900
  static const Color inkSecondary = Color(0xFF64748B); // Slate 500
  static const Color inkMuted = Color(0xFF94A3B8);     // Slate 400

  // ── Semantic Colors ──
  static const Color income = Color(0xFF10B981);   // Mint Green
  static const Color expense = Color(0xFFEF4444);  // Coral Red
  static const Color warning = Color(0xFFF59E0B);  // Amber

  // ── Glass Border & Accent ──
  static const Color glassBorder = Color(0x99FFFFFF);      // White with 60% opacity
  static const Color glassCardBorder = Color(0xCCD1D5DB);  // Subtle gray/white border

  // ── Aurora Pastel Gradient (Header / Background) ──
  static const LinearGradient auroraBackground = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF86EFAC), // Mint 300
      Color(0xFFA7F3D0), // Mint 200
      Color(0xFFDBEAFE), // Blue 100
      Color(0xFFBAE6FD), // Sky 200
      Color(0xFF93C5FD), // Blue 300
    ],
    stops: [0.0, 0.25, 0.55, 0.80, 1.0],
  );

  // ── Luminous Aurora Gradient (FAB & Active Elements) ──
  static const LinearGradient luminousAurora = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF2563EB), // Royal Blue
      Color(0xFF51C5F7), // Cyan Glow
      Color(0xFF44E1CC), // Mint Teal
      Color(0xFF34D399), // Emerald
    ],
    stops: [0.0, 0.40, 0.85, 1.0],
  );

  // ── Deep Slate Hero Gradient ──
  static const LinearGradient heroSlate = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF0F172A),
      Color(0xFF1E293B),
    ],
  );

  // ── Soft Shadows ──
  static List<BoxShadow> cardShadow = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.04),
      blurRadius: 20,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.02),
      blurRadius: 6,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> floatingNavShadow = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.10),
      blurRadius: 32,
      offset: const Offset(0, 12),
    ),
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> luminousFabShadow = [
    BoxShadow(
      color: const Color(0xFF2563EB).withValues(alpha: 0.45),
      blurRadius: 25,
      offset: const Offset(0, 10),
    ),
    BoxShadow(
      color: const Color(0xFF34D399).withValues(alpha: 0.35),
      blurRadius: 16,
      offset: const Offset(0, 6),
    ),
  ];
}
```

---

## 4. Reusable Flutter Components

### 4.1. Reusable `GlassCard` (Frosted Glass Container)

Buat file `lib/shared/widgets/glass_card.dart`:

```dart
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry padding;
  final EdgeInsetsGeometry? margin;
  final double blur;
  final double opacity;
  final Color? backgroundColor;
  final Border? border;
  final List<BoxShadow>? boxShadow;

  const GlassCard({
    super.key,
    required this.child,
    this.borderRadius = 24.0,
    this.padding = const EdgeInsets.all(16.0),
    this.margin,
    this.blur = 16.0,
    this.opacity = 0.88,
    this.backgroundColor,
    this.border,
    this.boxShadow,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: boxShadow ?? AppColors.cardShadow,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
          child: Container(
            padding: padding,
            decoration: BoxDecoration(
              color: (backgroundColor ?? Colors.white).withValues(alpha: opacity),
              borderRadius: BorderRadius.circular(borderRadius),
              border: border ??
                  Border.all(
                    color: Colors.white.withValues(alpha: 0.75),
                    width: 1.2,
                  ),
            ),
            child: child,
          ),
        ),
      ),
    );
  }
}
```

---

### 4.2. `AuroraBackground` (Latar Belakang Gradasi)

Buat file `lib/shared/widgets/aurora_background.dart`:

```dart
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class AuroraBackground extends StatelessWidget {
  final Widget child;
  final double headerHeight;

  const AuroraBackground({
    super.key,
    required this.child,
    this.headerHeight = 320,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Atmospheric Aurora Gradient Mesh at Top
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            child: Container(
              decoration: const BoxDecoration(
                gradient: AppColors.auroraBackground,
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      AppColors.background.withValues(alpha: 0.85),
                      AppColors.background,
                    ],
                    stops: const [0.5, 0.85, 1.0],
                  ),
                ),
              ),
            ),
          ),
          // Page Content
          SafeArea(
            bottom: false,
            child: child,
          ),
        ],
      ),
    );
  }
}
```

---

### 4.3. `LuminousFab` (Floating Action Button Bersinar)

Buat file `lib/shared/widgets/luminous_fab.dart`:

```dart
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class LuminousFab extends StatefulWidget {
  final VoidCallback onTap;
  final IconData icon;

  const LuminousFab({
    super.key,
    required this.onTap,
    this.icon = Icons.add_rounded,
  });

  @override
  State<LuminousFab> createState() => _LuminousFabState();
}

class _LuminousFabState extends State<LuminousFab> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) {
        setState(() => _isPressed = false);
        widget.onTap();
      },
      onTapCancel: () => setState(() => _isPressed = false),
      child: AnimatedScale(
        scale: _isPressed ? 0.92 : 1.0,
        duration: const Duration(milliseconds: 150),
        curve: Curves.easeOutCubic,
        child: Container(
          width: 58,
          height: 58,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppColors.luminousAurora,
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.75),
              width: 1.5,
            ),
            boxShadow: AppColors.luminousFabShadow,
          ),
          child: Center(
            child: Icon(
              widget.icon,
              color: Colors.white,
              size: 28,
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### 4.4. `FloatingGlassNavBar` (Dock Navigasi Melayang)

Buat file `lib/shared/widgets/floating_glass_nav_bar.dart`:

```dart
import 'dart:ui';
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class FloatingGlassNavBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onIndexChanged;

  const FloatingGlassNavBar({
    super.key,
    required this.currentIndex,
    required this.onIndexChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).padding.bottom + 16,
          left: 28,
          right: 28,
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.92),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.85),
                  width: 1.2,
                ),
                boxShadow: AppColors.floatingNavShadow,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _navItem(Icons.home_rounded, 0, "Home"),
                  _navItem(Icons.receipt_long_rounded, 1, "Mutasi"),
                  _navItem(Icons.bar_chart_rounded, 2, "Laporan"),
                  _navItem(Icons.account_balance_wallet_rounded, 3, "Dompet"),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(IconData icon, int index, String label) {
    final isSelected = currentIndex == index;
    return GestureDetector(
      onTap: () => onIndexChanged(index),
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeInOut,
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.ink : Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 22,
          color: isSelected ? Colors.white : AppColors.inkSecondary,
        ),
      ),
    );
  }
}
```

---

### 4.5. `GlassCategoryChip` (Pill Filter Aktif / Kaca)

```dart
import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class GlassCategoryChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const GlassCategoryChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(999),
          gradient: isSelected ? AppColors.luminousAurora : null,
          color: isSelected ? null : Colors.white.withValues(alpha: 0.85),
          border: Border.all(
            color: isSelected
                ? Colors.white.withValues(alpha: 0.75)
                : const Color(0xFFE2E8F0),
            width: 1.2,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF2563EB).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ]
              : AppColors.cardShadow,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: isSelected ? Colors.white : AppColors.inkSecondary,
          ),
        ),
      ),
    );
  }
}
```

---

## 5. Contoh Implementasi Layar Utuh (`HomeScreen.dart`)

```dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_colors.dart';
import 'shared/widgets/aurora_background.dart';
import 'shared/widgets/glass_card.dart';
import 'shared/widgets/luminous_fab.dart';
import 'shared/widgets/floating_glass_nav_bar.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _navIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: ThemeData(
        textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      ),
      child: AuroraBackground(
        child: Stack(
          children: [
            // Scrollable Content
            ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 120),
              children: [
                // ── Header Utility Row ──
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          "Senin, 5 Oktober",
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.inkSecondary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          "Selamat Pagi, Naufal 👋",
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                            color: AppColors.ink,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                    // Notification Button
                    GlassCard(
                      padding: const EdgeInsets.all(10),
                      borderRadius: 999,
                      child: const Icon(Icons.notifications_none_rounded, size: 22, color: AppColors.ink),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // ── Primary Hero Balance Card ──
                GlassCard(
                  padding: const EdgeInsets.all(22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Total Saldo Aktif",
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.inkSecondary,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.income.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(999),
                            ),
                            child: const Text(
                              "+12.5% bln ini",
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.income,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Rp 14.850.000",
                        style: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                          color: AppColors.ink,
                          letterSpacing: -1,
                        ),
                      ),
                      const SizedBox(height: 18),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _metricColumn(
                              "Pemasukan",
                              "Rp 8.500.000",
                              Icons.arrow_downward_rounded,
                              AppColors.income,
                            ),
                          ),
                          Container(width: 1, height: 32, color: const Color(0xFFF1F5F9)),
                          Expanded(
                            child: _metricColumn(
                              "Pengeluaran",
                              "Rp 3.250.000",
                              Icons.arrow_upward_rounded,
                              AppColors.expense,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // ── Section Header ──
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "Transaksi Terakhir",
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    Text(
                      "Lihat Semua",
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF2563EB),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // ── Transaction Item ──
                _transactionItem(
                  title: "Kopi Kenangan Mantan",
                  category: "Minuman & Kafe",
                  amount: "-Rp 28.000",
                  date: "Hari ini, 10:30",
                  isExpense: true,
                  icon: Icons.coffee_rounded,
                ),
                _transactionItem(
                  title: "Transfer Gaji Pokok",
                  category: "Pemasukan",
                  amount: "+Rp 8.500.000",
                  date: "Kemarin, 09:00",
                  isExpense: false,
                  icon: Icons.work_outline_rounded,
                ),
              ],
            ),

            // ── Floating Action Button (FAB) ──
            Positioned(
              right: 24,
              bottom: MediaQuery.of(context).padding.bottom + 90,
              child: LuminousFab(
                onTap: () {
                  // Buka Bottom Sheet Tambah Transaksi
                },
              ),
            ),

            // ── Floating Glass Bottom Nav ──
            FloatingGlassNavBar(
              currentIndex: _navIndex,
              onIndexChanged: (i) => setState(() => _navIndex = i),
            ),
          ],
        ),
      ),
    );
  }

  Widget _metricColumn(String label, String value, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: color.withValues(alpha: 0.12),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 11, color: AppColors.inkSecondary, fontWeight: FontWeight.w500)),
              Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.ink)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _transactionItem({
    required String title,
    required String category,
    required String amount,
    required String date,
    required bool isExpense,
    required IconData icon,
  }) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      borderRadius: 18,
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: const Color(0xFFF1F5F9),
            child: Icon(icon, color: AppColors.ink, size: 20),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.ink)),
                const SizedBox(height: 2),
                Text("$category • $date", style: const TextStyle(fontSize: 11, color: AppColors.inkSecondary)),
              ],
            ),
          ),
          Text(
            amount,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: isExpense ? AppColors.expense : AppColors.income,
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 6. Tips Performa & Best Practices di Flutter

1. **Selalu Gunakan `ClipRRect` Membungkus `BackdropFilter`**:
   * Jika tidak dibungkus `ClipRRect`, shader blur akan diaplikasikan ke seluruh kanvas layar sehingga membebani GPU.
2. **Hindari Blur di Ratusan Item List**:
   * Pasang `GlassCard` dengan `BackdropFilter` pada elemen *sticky/floating* (Navbar, FAB, Header, Bottom Sheet).
   * Untuk item list transaksi yang sangat panjang, gunakan background solid `Colors.white` atau semi-transparan tanpa `BackdropFilter` (`color: Colors.white.withOpacity(0.9)`) untuk menjaga kecepatan rendering 120 FPS.
3. **Gunakan Engine Impeller (Default di Flutter Terbaru)**:
   * Impeller mengkompilasi shader blur secara AOT (*Ahead-of-Time*) sehingga bebas dari *jank* (patah-patah) saat membuka modal atau navigasi.
4. **Gunakan `withValues(alpha: ...)`**:
   * Pada Flutter 3.27+, gunakan `.withValues(alpha: 0.8)` sebagai pengganti `.withOpacity(0.8)` untuk presisi floating-point yang lebih baik dan performa optimal.
