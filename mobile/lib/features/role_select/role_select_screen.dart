import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../core/providers/app_provider.dart';
import 'package:provider/provider.dart';

class RoleSelectScreen extends StatelessWidget {
  const RoleSelectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const SizedBox(height: 32),
              // Logo
              Text(
                'QUEUEPE',
                style: GoogleFonts.bebasNeue(
                  fontSize: 48,
                  color: AppTheme.saffron,
                  letterSpacing: 4,
                ),
              ),
              Text(
                'Skip the Line',
                style: GoogleFonts.notoSans(
                  fontSize: 14,
                  color: AppTheme.ink3,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                width: 40,
                height: 3,
                decoration: BoxDecoration(
                  color: AppTheme.saffron,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 48),
              Text(
                'WHO ARE YOU?',
                style: GoogleFonts.bebasNeue(
                  fontSize: 28,
                  color: AppTheme.ink,
                  letterSpacing: 3,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Choose your role to get started',
                style: GoogleFonts.notoSans(fontSize: 14, color: AppTheme.ink3),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // Client Card
              _RoleCard(
                emoji: '🧑‍💼',
                title: 'CLIENT',
                subtitle: 'I need someone to stand in queue for me',
                color: AppTheme.saffron,
                softColor: AppTheme.saffronSoft,
                bullets: const ['Book a stander in seconds', 'Live queue tracking', 'WhatsApp & Voice booking'],
                onTap: () {
                  context.read<AppProvider>().setRole(UserRole.client);
                  context.go('/client/home');
                },
              ),

              const SizedBox(height: 16),

              // Stander Card
              _RoleCard(
                emoji: '🦸',
                title: 'STANDER',
                subtitle: 'I earn money by standing in queues',
                color: AppTheme.green,
                softColor: AppTheme.greenSoft,
                bullets: const ['Accept jobs nearby', 'Earn ₹200–₹800 per job', 'Daily payout'],
                onTap: () {
                  context.read<AppProvider>().setRole(UserRole.stander);
                  context.go('/stander/home');
                },
              ),

              const Spacer(),
              Text(
                'By continuing you agree to our Terms & Privacy Policy',
                style: GoogleFonts.notoSans(fontSize: 11, color: AppTheme.ink3),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatefulWidget {
  final String emoji;
  final String title;
  final String subtitle;
  final Color color;
  final Color softColor;
  final List<String> bullets;
  final VoidCallback onTap;

  const _RoleCard({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.softColor,
    required this.bullets,
    required this.onTap,
  });

  @override
  State<_RoleCard> createState() => _RoleCardState();
}

class _RoleCardState extends State<_RoleCard> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 120),
      lowerBound: 0.97,
      upperBound: 1.0,
    )..value = 1.0;
    _scaleAnim = _controller;
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _controller.reverse(),
      onTapUp: (_) {
        _controller.forward();
        widget.onTap();
      },
      onTapCancel: () => _controller.forward(),
      child: ScaleTransition(
        scale: _scaleAnim,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppTheme.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: widget.color.withOpacity(0.4), width: 1.5),
            boxShadow: [
              BoxShadow(
                color: widget.color.withOpacity(0.08),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: widget.softColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(widget.emoji, style: const TextStyle(fontSize: 26)),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: GoogleFonts.bebasNeue(
                        fontSize: 22,
                        color: widget.color,
                        letterSpacing: 2,
                      ),
                    ),
                    Text(
                      widget.subtitle,
                      style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink3),
                    ),
                    const SizedBox(height: 10),
                    ...widget.bullets.map((b) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Row(
                            children: [
                              Icon(Icons.check_circle, color: widget.color, size: 14),
                              const SizedBox(width: 6),
                              Text(b, style: GoogleFonts.notoSans(fontSize: 12, color: AppTheme.ink2)),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              Icon(Icons.arrow_forward_ios, color: widget.color, size: 16),
            ],
          ),
        ),
      ),
    );
  }
}
