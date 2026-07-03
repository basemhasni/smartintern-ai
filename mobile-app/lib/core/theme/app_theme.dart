import 'package:flutter/material.dart';

class AppTheme {
  const AppTheme._();

  static const Color navy = Color(0xFF07111F);
  static const Color surface = Color(0xFF101A2E);
  static const Color surfaceSoft = Color(0xFF17243A);
  static const Color blue = Color(0xFF1C62F2);
  static const Color violet = Color(0xFF7C3AED);
  static const Color cyan = Color(0xFF22D3EE);
  static const Color text = Color(0xFFF8FAFC);
  static const Color muted = Color(0xFF94A3B8);
  static const Color line = Color(0x33FFFFFF);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [blue, violet, cyan],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    colors: [Color(0xFF040B18), Color(0xFF0F1B34), Color(0xFF1E1450)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get darkTheme {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: blue,
      brightness: Brightness.dark,
      primary: blue,
      secondary: cyan,
      surface: surface,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: navy,
      fontFamily: 'Roboto',
      textTheme: const TextTheme(
        headlineLarge: TextStyle(
          color: text,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        headlineMedium: TextStyle(
          color: text,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        titleLarge: TextStyle(
          color: text,
          fontWeight: FontWeight.w800,
          letterSpacing: 0,
        ),
        bodyLarge: TextStyle(color: text, height: 1.45),
        bodyMedium: TextStyle(color: muted, height: 1.45),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: text,
        centerTitle: false,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white.withValues(alpha: 0.08),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: line),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: line),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(18),
          borderSide: const BorderSide(color: cyan, width: 1.4),
        ),
        hintStyle: const TextStyle(color: muted),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surface.withValues(alpha: 0.92),
        indicatorColor: blue.withValues(alpha: 0.22),
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            color: states.contains(WidgetState.selected) ? text : muted,
            fontWeight: FontWeight.w700,
            fontSize: 12,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(
            color: states.contains(WidgetState.selected) ? cyan : muted,
          ),
        ),
      ),
    );
  }
}
