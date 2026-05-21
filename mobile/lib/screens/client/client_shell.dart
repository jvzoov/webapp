// ============================================================
// QueuePe Mobile — Client Shell with Bottom Navigation
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class ClientShell extends StatelessWidget {
  final Widget child;
  const ClientShell({super.key, required this.child});

  static const _tabs = [
    ('/client/home',     Icons.home_rounded,      'HOME'),
    ('/client/book',     Icons.edit_note_rounded,  'BOOK'),
    ('/client/track',    Icons.gps_fixed_rounded,  'TRACK'),
    ('/client/whatsapp', Icons.chat_rounded,       'WA'),
    ('/client/history',  Icons.menu_book_rounded,  'HISTORY'),
  ];

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    for (int i = 0; i < _tabs.length; i++) {
      if (loc.startsWith(_tabs[i].$1)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);

    return Scaffold(
      // ─── Top Bar ────────────────────────────────────────
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: RichText(
          text: TextSpan(
            style: AppText.display(26, color: Colors.white),
            children: const [
              TextSpan(text: 'Queue'),
              TextSpan(
                text: 'Pe',
                style: TextStyle(color: AppColors.saffron),
              ),
            ],
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              child: Text(
                'CLIENT',
                style: AppText.mono(10, color: AppColors.saffron)
                    .copyWith(letterSpacing: 0.6),
              ),
            ),
          ),
        ],
      ),
      body: child,

      // ─── Bottom Navigation ──────────────────────────────
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: AppColors.border, width: 1.5),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: idx,
          onTap: (i) => context.go(_tabs[i].$1),
          items: _tabs.map((t) => BottomNavigationBarItem(
            icon: Icon(t.$2),
            label: t.$3,
          )).toList(),
        ),
      ),
    );
  }
}
