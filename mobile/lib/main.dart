// ============================================================
// QueuePe Mobile — App Entry Point
// ============================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme.dart';
import 'core/supabase_config.dart';
import 'app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  // Status bar style
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: AppColors.ink,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AppColors.surface,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));

  // Initialize Supabase
  await SupabaseConfig.initialize();

  runApp(const ProviderScope(child: QueuePeApp()));
}

class QueuePeApp extends ConsumerWidget {
  const QueuePeApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);

    return MaterialApp.router(
      title: 'QueuePe',
      debugShowCheckedModeBanner: false,
      theme: appTheme(),
      routerConfig: router,
    );
  }
}
