import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import '../../features/role_select/role_select_screen.dart';
import '../../features/client/home/client_home_screen.dart';
import '../../features/client/book/book_screen.dart';
import '../../features/client/track/track_screen.dart';
import '../../features/client/history/history_screen.dart';
import '../../features/client/map/map_screen.dart';
import '../../features/client/whatsapp/whatsapp_screen.dart';
import '../../features/client/voice/voice_screen.dart';
import '../../features/stander/home/stander_home_screen.dart';
import '../../features/stander/job/job_screen.dart';
import '../../features/stander/checkin/checkin_screen.dart';
import '../../features/stander/earnings/earnings_screen.dart';
import '../../features/stander/kyc/kyc_screen.dart';
import '../../features/stander/geofence/geofence_screen.dart';
import '../layout/client_shell.dart';
import '../layout/stander_shell.dart';

class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final _clientShellKey = GlobalKey<NavigatorState>();
  static final _standerShellKey = GlobalKey<NavigatorState>();

  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      // Role Selection (first screen)
      GoRoute(
        path: '/',
        builder: (context, state) => const RoleSelectScreen(),
      ),

      // ── CLIENT SHELL ──────────────────────────────
      ShellRoute(
        navigatorKey: _clientShellKey,
        builder: (context, state, child) => ClientShell(child: child),
        routes: [
          GoRoute(
            path: '/client/home',
            builder: (context, state) => const ClientHomeScreen(),
          ),
          GoRoute(
            path: '/client/book',
            builder: (context, state) {
              final location = state.uri.queryParameters['location'] ?? '';
              return BookScreen(location: location);
            },
          ),
          GoRoute(
            path: '/client/track/:bookingId',
            builder: (context, state) {
              final bookingId = state.pathParameters['bookingId']!;
              return TrackScreen(bookingId: bookingId);
            },
          ),
          GoRoute(
            path: '/client/history',
            builder: (context, state) => const HistoryScreen(),
          ),
          GoRoute(
            path: '/client/map',
            builder: (context, state) {
              final bookingId = state.uri.queryParameters['bookingId'] ?? '';
              return MapScreen(bookingId: bookingId);
            },
          ),
          GoRoute(
            path: '/client/whatsapp',
            builder: (context, state) => const WhatsAppScreen(),
          ),
          GoRoute(
            path: '/client/voice',
            builder: (context, state) => const VoiceScreen(),
          ),
        ],
      ),

      // ── STANDER SHELL ─────────────────────────────
      ShellRoute(
        navigatorKey: _standerShellKey,
        builder: (context, state, child) => StanderShell(child: child),
        routes: [
          GoRoute(
            path: '/stander/home',
            builder: (context, state) => const StanderHomeScreen(),
          ),
          GoRoute(
            path: '/stander/job/:jobId',
            builder: (context, state) {
              final jobId = state.pathParameters['jobId']!;
              return JobScreen(jobId: jobId);
            },
          ),
          GoRoute(
            path: '/stander/checkin/:bookingId',
            builder: (context, state) {
              final bookingId = state.pathParameters['bookingId']!;
              return CheckinScreen(bookingId: bookingId);
            },
          ),
          GoRoute(
            path: '/stander/earnings',
            builder: (context, state) => const EarningsScreen(),
          ),
          GoRoute(
            path: '/stander/kyc',
            builder: (context, state) => const KycScreen(),
          ),
          GoRoute(
            path: '/stander/geofence/:bookingId',
            builder: (context, state) {
              final bookingId = state.pathParameters['bookingId']!;
              return GeofenceScreen(bookingId: bookingId);
            },
          ),
        ],
      ),
    ],
  );
}
