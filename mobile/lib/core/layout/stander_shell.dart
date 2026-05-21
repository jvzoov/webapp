import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';

class StanderShell extends StatelessWidget {
  final Widget child;
  const StanderShell({super.key, required this.child});

  int _locationToIndex(String location) {
    if (location.startsWith('/stander/home')) return 0;
    if (location.startsWith('/stander/earnings')) return 1;
    if (location.startsWith('/stander/kyc')) return 2;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).uri.toString();
    final currentIndex = _locationToIndex(location);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surface,
          border: Border(top: BorderSide(color: AppTheme.border, width: 1)),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(icon: Icons.work_outline_rounded, label: 'Jobs', index: 0, currentIndex: currentIndex, onTap: () => context.go('/stander/home')),
                _NavItem(icon: Icons.account_balance_wallet_outlined, label: 'Earnings', index: 1, currentIndex: currentIndex, onTap: () => context.go('/stander/earnings')),
                _NavItem(icon: Icons.verified_user_outlined, label: 'KYC', index: 2, currentIndex: currentIndex, onTap: () => context.go('/stander/kyc')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index;
  final int currentIndex;
  final VoidCallback onTap;

  const _NavItem({required this.icon, required this.label, required this.index, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isActive = index == currentIndex;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.saffronSoft : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: isActive ? AppTheme.saffron : AppTheme.ink3, size: 22),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                color: isActive ? AppTheme.saffron : AppTheme.ink3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
