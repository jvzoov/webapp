// ============================================================
// QueuePe Mobile — GoRouter Configuration
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'screens/role_select_screen.dart';
import 'screens/client/client_shell.dart';
import 'screens/client/client_home_screen.dart';
import 'screens/client/client_book_screen.dart';
import 'screens/client/client_track_screen.dart';
import 'screens/client/client_history_screen.dart';
import 'screens/client/client_whatsapp_screen.dart';
import 'screens/client/client_voice_screen.dart';
import 'screens/client/client_map_screen.dart';
import 'screens/stander/stander_shell.dart';
import 'screens/stander/stander_home_screen.dart';
import 'screens/stander/stander_checkin_screen.dart';
import 'screens/stander/stander_kyc_screen.dart';
import 'screens/stander/stander_geofence_screen.dart';
import 'screens/stander/stander_wallet_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/',
    routes: [
      // ─── Role Selection (Landing) ───────────────────────
      GoRoute(
        path: '/',
        builder: (context, state) => const RoleSelectScreen(),
      ),

      // ─── Client Routes ────────────────────────────────
      GoRoute(
        path: '/client',
        redirect: (context, state) => '/client/home',
        routes: [
          ShellRoute(
            builder: (context, state, child) => ClientShell(child: child),
            routes: [
              GoRoute(
                path: 'home',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: ClientHomeScreen(),
                ),
              ),
              GoRoute(
                path: 'book',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: ClientBookScreen(),
                ),
              ),
              GoRoute(
                path: 'track',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: ClientTrackScreen(),
                ),
              ),
              GoRoute(
                path: 'whatsapp',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: ClientWhatsAppScreen(),
                ),
              ),
              GoRoute(
                path: 'history',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: ClientHistoryScreen(),
                ),
              ),
            ],
          ),
          // Client Extra Pages (no bottom nav)
          GoRoute(
            path: 'voice',
            builder: (context, state) => const ClientVoiceScreen(),
          ),
          GoRoute(
            path: 'map',
            builder: (context, state) => const ClientMapScreen(),
          ),
        ],
      ),

      // ─── Stander Routes ───────────────────────────────
      GoRoute(
        path: '/stander',
        redirect: (context, state) => '/stander/home',
        routes: [
          ShellRoute(
            builder: (context, state, child) => StanderShell(child: child),
            routes: [
              GoRoute(
                path: 'home',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: StanderHomeScreen(),
                ),
              ),
              GoRoute(
                path: 'checkin',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: StanderCheckinScreen(),
                ),
              ),
              GoRoute(
                path: 'kyc',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: StanderKycScreen(),
                ),
              ),
              GoRoute(
                path: 'geofence',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: StanderGeofenceScreen(),
                ),
              ),
              GoRoute(
                path: 'wallet',
                pageBuilder: (context, state) => const NoTransitionPage(
                  child: StanderWalletScreen(),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
