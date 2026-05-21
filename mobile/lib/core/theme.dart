// ============================================================
// QueuePe Mobile — Design System & Theme
// Premium design tokens matching the HTML reference UI
// ============================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// ─── Color Palette ──────────────────────────────────────────
class AppColors {
  AppColors._();

  // Brand
  static const saffron      = Color(0xFFFF6B00);
  static const saffron2     = Color(0xFFFF8C3A);
  static const saffronSoft  = Color(0x1FFF6B00); // 12% opacity

  // Surfaces
  static const bg           = Color(0xFFF7F4EE);
  static const bg2          = Color(0xFFEDE9E0);
  static const bg3          = Color(0xFFE2DDD3);
  static const surface      = Color(0xFFFFFFFF);

  // Ink / Text
  static const ink          = Color(0xFF1A1612);
  static const ink2         = Color(0xFF4A4540);
  static const ink3         = Color(0xFF8A8480);

  // Borders
  static const border       = Color(0xFFD4CFC6);
  static const border2      = Color(0xFFC4BFB6);

  // Semantic
  static const green        = Color(0xFF1A7A4A);
  static const greenSoft    = Color(0x1A1A7A4A);
  static const red          = Color(0xFFC0392B);
  static const redSoft      = Color(0x1AC0392B);
  static const blue         = Color(0xFF1A5276);
  static const blueSoft     = Color(0x1A1A5276);
  static const amber        = Color(0xFFD4A017);
  static const amberSoft    = Color(0x1FD4A017);
}

// ─── Border Radius ──────────────────────────────────────────
class AppRadius {
  AppRadius._();
  static const double card  = 10;
  static const double chip  = 10;
  static const double btn   = 10;
  static const double input = 8;
  static const double pill  = 999;
}

// ─── Spacing ────────────────────────────────────────────────
class AppSpacing {
  AppSpacing._();
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double section = 16;
}

// ─── Text Styles ────────────────────────────────────────────
class AppText {
  AppText._();

  // Display (Bebas Neue)
  static TextStyle display(double size, {Color? color, double? letterSpacing}) {
    return GoogleFonts.bebasNeue(
      fontSize: size,
      color: color ?? AppColors.ink,
      letterSpacing: letterSpacing ?? 0.5,
      height: 1.0,
    );
  }

  // Body (Noto Sans)
  static TextStyle body(double size, {
    Color? color,
    FontWeight? weight,
    double? height,
  }) {
    return GoogleFonts.notoSans(
      fontSize: size,
      color: color ?? AppColors.ink,
      fontWeight: weight ?? FontWeight.w400,
      height: height ?? 1.6,
    );
  }

  // Mono (JetBrains Mono)
  static TextStyle mono(double size, {
    Color? color,
    FontWeight? weight,
    double? letterSpacing,
  }) {
    return GoogleFonts.jetBrainsMono(
      fontSize: size,
      color: color ?? AppColors.ink3,
      fontWeight: weight ?? FontWeight.w400,
      letterSpacing: letterSpacing ?? 0.06 * size,
    );
  }

  // Common presets
  static TextStyle get heroTitle => display(48, color: Colors.white);
  static TextStyle get sectionTitle => display(20);
  static TextStyle get sectionLabel => mono(10).copyWith(
    color: AppColors.ink3,
    letterSpacing: 1.0,
  );
  static TextStyle get cardTitle => body(15, weight: FontWeight.w600);
  static TextStyle get cardSubtitle => body(13, color: AppColors.ink3);
  static TextStyle get buttonText => display(20, color: Colors.white, letterSpacing: 1.0);
  static TextStyle get chipLabel => body(14, weight: FontWeight.w600);
  static TextStyle get chipWait => mono(11);
  static TextStyle get formLabel => mono(11).copyWith(
    letterSpacing: 0.66,
  );
  static TextStyle get priceDisplay => display(28, color: AppColors.saffron);
  static TextStyle get earningsDisplay => display(32, color: AppColors.saffron);
}

// ─── Theme Data ─────────────────────────────────────────────
ThemeData appTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.bg,
    colorScheme: const ColorScheme.light(
      primary: AppColors.saffron,
      secondary: AppColors.ink,
      surface: AppColors.surface,
      error: AppColors.red,
      onPrimary: Colors.white,
      onSecondary: Colors.white,
      onSurface: AppColors.ink,
      onError: Colors.white,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.ink,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.bebasNeue(
        fontSize: 26,
        color: Colors.white,
        letterSpacing: 1,
      ),
    ),
    cardTheme: CardThemeData(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
        side: const BorderSide(color: AppColors.border, width: 1.5),
      ),
      margin: EdgeInsets.zero,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.bg,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.input),
        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.input),
        borderSide: const BorderSide(color: AppColors.border, width: 1.5),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppRadius.input),
        borderSide: const BorderSide(color: AppColors.saffron, width: 1.5),
      ),
      labelStyle: AppText.formLabel,
      hintStyle: AppText.body(14, color: AppColors.ink3),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.saffron,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.btn),
        ),
        textStyle: AppText.buttonText,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.ink,
        side: const BorderSide(color: AppColors.border, width: 1.5),
        padding: const EdgeInsets.symmetric(vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.btn),
        ),
        textStyle: AppText.buttonText.copyWith(color: AppColors.ink),
      ),
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.border,
      thickness: 1,
      space: 32,
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.saffron,
      unselectedItemColor: AppColors.ink3,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      selectedLabelStyle: TextStyle(
        fontFamily: 'JetBrainsMono',
        fontSize: 9,
        letterSpacing: 0.6,
      ),
      unselectedLabelStyle: TextStyle(
        fontFamily: 'JetBrainsMono',
        fontSize: 9,
        letterSpacing: 0.6,
      ),
    ),
  );
}
