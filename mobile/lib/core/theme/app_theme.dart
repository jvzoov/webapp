import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // ── Brand Colors (from original HTML CSS vars) ──
  static const Color saffron = Color(0xFFFF6B00);
  static const Color saffron2 = Color(0xFFFF8C3A);
  static const Color saffronSoft = Color(0x1FFF6B00);
  static const Color bg = Color(0xFFF7F4EE);
  static const Color bg2 = Color(0xFFEDE9E0);
  static const Color bg3 = Color(0xFFE2DDD3);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color ink = Color(0xFF1A1612);
  static const Color ink2 = Color(0xFF4A4540);
  static const Color ink3 = Color(0xFF8A8480);
  static const Color border = Color(0xFFD4CFC6);
  static const Color border2 = Color(0xFFC4BFB6);
  static const Color green = Color(0xFF1A7A4A);
  static const Color greenSoft = Color(0x1A1A7A4A);
  static const Color red = Color(0xFFC0392B);
  static const Color redSoft = Color(0x1AC0392B);
  static const Color blue = Color(0xFF1A5276);
  static const Color blueSoft = Color(0x1A1A5276);
  static const Color amber = Color(0xFFD4A017);
  static const Color amberSoft = Color(0x1FD4A017);

  static ThemeData light() {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: bg,
      colorScheme: ColorScheme.light(
        primary: saffron,
        secondary: saffron2,
        surface: surface,
        onPrimary: Colors.white,
        onSurface: ink,
        outline: border,
      ),
      textTheme: GoogleFonts.notoSansTextTheme().copyWith(
        displayLarge: GoogleFonts.bebasNeue(
          color: ink,
          letterSpacing: 1.2,
        ),
        displayMedium: GoogleFonts.bebasNeue(
          color: ink,
          letterSpacing: 1.0,
        ),
        titleLarge: GoogleFonts.notoSans(
          fontWeight: FontWeight.w600,
          color: ink,
        ),
        titleMedium: GoogleFonts.notoSans(
          fontWeight: FontWeight.w500,
          color: ink,
        ),
        bodyLarge: GoogleFonts.notoSans(color: ink2),
        bodyMedium: GoogleFonts.notoSans(color: ink2),
        bodySmall: GoogleFonts.notoSans(color: ink3),
        labelSmall: GoogleFonts.jetBrainsMono(color: ink3),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: ink,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: GoogleFonts.bebasNeue(
          fontSize: 22,
          color: ink,
          letterSpacing: 1.5,
        ),
        iconTheme: const IconThemeData(color: ink),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: saffron,
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.notoSans(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: saffron,
          side: const BorderSide(color: saffron, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: GoogleFonts.notoSans(
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: saffron, width: 2),
        ),
        labelStyle: GoogleFonts.notoSans(color: ink3),
        hintStyle: GoogleFonts.notoSans(color: ink3),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: const BorderSide(color: border, width: 1.5),
        ),
        margin: const EdgeInsets.only(bottom: 12),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surface,
        selectedItemColor: saffron,
        unselectedItemColor: ink3,
        elevation: 8,
        type: BottomNavigationBarType.fixed,
      ),
    );
  }
}
