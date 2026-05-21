// QueuePe Mobile — Stander Shell
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class StanderShell extends StatelessWidget {
  final Widget child;
  const StanderShell({super.key, required this.child});

  static const _tabs = [
    ('/stander/home',     Icons.home_repair_service_rounded, 'HOME'),
    ('/stander/checkin',  Icons.check_circle_outline,        'CHECKIN'),
    ('/stander/kyc',      Icons.verified_user_outlined,      'KYC'),
    ('/stander/geofence', Icons.radar_outlined,              'GEOFENCE'),
    ('/stander/wallet',   Icons.account_balance_wallet_outlined, 'WALLET'),
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
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: RichText(
          text: TextSpan(
            style: AppText.display(26, color: Colors.white),
            children: const [TextSpan(text: 'Queue'), TextSpan(text: 'Pe', style: TextStyle(color: AppColors.saffron))],
          ),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
            child: Text('STANDER', style: AppText.mono(10, color: AppColors.green).copyWith(letterSpacing: 0.6)),
          ),
        ],
      ),
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border, width: 1.5))),
        child: BottomNavigationBar(
          currentIndex: idx,
          onTap: (i) => context.go(_tabs[i].$1),
          selectedItemColor: AppColors.green,
          items: _tabs.map((t) => BottomNavigationBarItem(icon: Icon(t.$2), label: t.$3)).toList(),
        ),
      ),
    );
  }
}
