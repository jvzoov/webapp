// ============================================================
// QueuePe Mobile — Role Selection Landing Screen
// Two-sided Client/Stander entry point (replaces marketing page)
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../core/theme.dart';

class RoleSelectScreen extends StatefulWidget {
  const RoleSelectScreen({super.key});

  @override
  State<RoleSelectScreen> createState() => _RoleSelectScreenState();
}

class _RoleSelectScreenState extends State<RoleSelectScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _animCtrl;
  late Animation<double> _fadeIn;
  late Animation<Offset> _slideUp;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeIn = CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut);
    _slideUp = Tween<Offset>(
      begin: const Offset(0, 0.15),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _animCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.ink,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeIn,
          child: SlideTransition(
            position: _slideUp,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                children: [
                  const Spacer(flex: 2),

                  // ─── Logo ─────────────────────────────────
                  RichText(
                    text: TextSpan(
                      style: AppText.display(52, color: Colors.white),
                      children: const [
                        TextSpan(text: 'Queue'),
                        TextSpan(
                          text: 'Pe',
                          style: TextStyle(color: AppColors.saffron),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    "INDIA'S QUEUE PROBLEM, SOLVED",
                    style: AppText.mono(10, color: AppColors.saffron)
                        .copyWith(letterSpacing: 1.2),
                  ),

                  const SizedBox(height: 40),

                  // ─── Tagline ──────────────────────────────
                  Text(
                    'Skip The Line.',
                    style: AppText.display(38, color: Colors.white),
                  ),
                  const SizedBox(height: 12),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      'We send a verified Stander to hold your spot at any RTO, hospital, bank or government office — while you carry on with your day.',
                      textAlign: TextAlign.center,
                      style: AppText.body(13, color: Colors.white54, height: 1.6),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ─── Stats Row ────────────────────────────
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _StatChip(label: '₹150/hr', sub: 'starts at'),
                      const SizedBox(width: 16),
                      _StatChip(label: '15min', sub: 'avg match'),
                      const SizedBox(width: 16),
                      _StatChip(label: '4.8★', sub: 'rating'),
                    ],
                  ),

                  const Spacer(flex: 2),

                  // ─── Role Buttons ─────────────────────────
                  Text(
                    'I WANT TO',
                    style: AppText.mono(10, color: Colors.white38)
                        .copyWith(letterSpacing: 1.5),
                  ),
                  const SizedBox(height: 16),

                  Row(
                    children: [
                      // CLIENT button
                      Expanded(
                        child: _RoleButton(
                          icon: Icons.person_outline_rounded,
                          label: 'SKIP QUEUE',
                          sub: 'Client',
                          color: AppColors.saffron,
                          onTap: () => context.go('/client/home'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // STANDER button
                      Expanded(
                        child: _RoleButton(
                          icon: Icons.directions_walk_rounded,
                          label: 'EARN MONEY',
                          sub: 'Stander',
                          color: AppColors.green,
                          onTap: () => context.go('/stander/home'),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // ─── Terms ────────────────────────────────
                  Text(
                    'By continuing you agree to our Terms of Service',
                    style: AppText.body(11, color: Colors.white24),
                    textAlign: TextAlign.center,
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Stat Chip Widget ───────────────────────────────────────
class _StatChip extends StatelessWidget {
  final String label;
  final String sub;

  const _StatChip({required this.label, required this.sub});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: AppText.display(22, color: AppColors.saffron),
        ),
        const SizedBox(height: 2),
        Text(
          sub.toUpperCase(),
          style: AppText.mono(9, color: Colors.white38)
              .copyWith(letterSpacing: 0.6),
        ),
      ],
    );
  }
}

// ─── Role Button Widget ─────────────────────────────────────
class _RoleButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final String sub;
  final Color color;
  final VoidCallback onTap;

  const _RoleButton({
    required this.icon,
    required this.label,
    required this.sub,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              Icon(icon, color: Colors.white, size: 32),
              const SizedBox(height: 10),
              Text(
                label,
                style: AppText.display(22, color: Colors.white, letterSpacing: 1),
              ),
              const SizedBox(height: 4),
              Text(
                sub.toUpperCase(),
                style: AppText.mono(10, color: Colors.white70)
                    .copyWith(letterSpacing: 1),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
