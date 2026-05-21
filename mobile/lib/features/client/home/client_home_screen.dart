import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/services/supabase_service.dart';

const _locations = [
  {'name': 'Aadhaar / PAN Center', 'icon': '🏛️', 'wait': '~45 min', 'standers': '12 active', 'type': 'govt'},
  {'name': 'Railway Counter', 'icon': '🚂', 'wait': '~30 min', 'standers': '8 active', 'type': 'railway'},
  {'name': 'Hospital OPD', 'icon': '🏥', 'wait': '~60 min', 'standers': '15 active', 'type': 'hospital'},
  {'name': 'Bank Branch', 'icon': '🏦', 'wait': '~25 min', 'standers': '6 active', 'type': 'bank'},
  {'name': 'Passport Seva', 'icon': '🛂', 'wait': '~90 min', 'standers': '9 active', 'type': 'passport'},
  {'name': 'Electricity Office', 'icon': '⚡', 'wait': '~20 min', 'standers': '4 active', 'type': 'utility'},
  {'name': 'RTO / Driving License', 'icon': '🚗', 'wait': '~50 min', 'standers': '11 active', 'type': 'rto'},
  {'name': 'Custom Location', 'icon': '📍', 'wait': 'Varies', 'standers': 'On demand', 'type': 'custom'},
];

class ClientHomeScreen extends StatelessWidget {
  const ClientHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            backgroundColor: AppTheme.surface,
            elevation: 0,
            titleSpacing: 20,
            title: Row(
              children: [
                Text('QUEUE', style: GoogleFonts.bebasNeue(fontSize: 22, color: AppTheme.saffron, letterSpacing: 2)),
                Text('PE', style: GoogleFonts.bebasNeue(fontSize: 22, color: AppTheme.ink, letterSpacing: 2)),
              ],
            ),
            actions: [
              Container(
                margin: const EdgeInsets.only(right: 16),
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.saffronSoft,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('CLIENT', style: GoogleFonts.notoSans(fontSize: 11, fontWeight: FontWeight.w600, color: AppTheme.saffron)),
              ),
            ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(height: 1, color: AppTheme.border),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero section
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.saffron, AppTheme.saffron2],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('SKIP THE LINE', style: GoogleFonts.bebasNeue(fontSize: 32, color: Colors.white, letterSpacing: 2)),
                        Text('Book a professional stander\nin under 60 seconds',
                            style: GoogleFonts.notoSans(fontSize: 13, color: Colors.white.withOpacity(0.9))),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            _HeroPill(icon: Icons.timer_outlined, text: '15 min avg booking'),
                            const SizedBox(width: 8),
                            _HeroPill(icon: Icons.verified, text: 'Verified standers'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Quick actions
                  Row(
                    children: [
                      Expanded(
                        child: _QuickAction(
                          icon: Icons.chat,
                          label: 'WhatsApp\nBooking',
                          color: const Color(0xFF25D366),
                          onTap: () => context.go('/client/whatsapp'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickAction(
                          icon: Icons.mic,
                          label: 'Voice\nBooking',
                          color: AppTheme.blue,
                          onTap: () => context.go('/client/voice'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  Text('WHERE DO YOU NEED A STANDER?',
                      style: GoogleFonts.bebasNeue(fontSize: 18, color: AppTheme.ink, letterSpacing: 1.5)),
                  const SizedBox(height: 4),
                  Text('Select a location type to book', style: GoogleFonts.notoSans(fontSize: 13, color: AppTheme.ink3)),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              delegate: SliverChildBuilderDelegate(
                (context, i) {
                  final loc = _locations[i];
                  return _LocationCard(location: loc);
                },
                childCount: _locations.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  final IconData icon;
  final String text;
  const _HeroPill({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Text(text, style: GoogleFonts.notoSans(fontSize: 11, color: Colors.white)),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: GoogleFonts.notoSans(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.ink))),
          ],
        ),
      ),
    );
  }
}

class _LocationCard extends StatelessWidget {
  final Map<String, dynamic> location;
  const _LocationCard({required this.location});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/client/book?location=${location['name']}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(location['icon']!, style: const TextStyle(fontSize: 28)),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(location['name']!, style: GoogleFonts.notoSans(fontSize: 12, fontWeight: FontWeight.w600, color: AppTheme.ink), maxLines: 2),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.timer_outlined, size: 11, color: AppTheme.ink3),
                    const SizedBox(width: 3),
                    Expanded(child: Text(location['wait']!, style: GoogleFonts.notoSans(fontSize: 10, color: AppTheme.ink3), overflow: TextOverflow.ellipsis)),
                  ],
                ),
                Row(
                  children: [
                    Icon(Icons.people_outline, size: 11, color: AppTheme.green),
                    const SizedBox(width: 3),
                    Expanded(child: Text(location['standers']!, style: GoogleFonts.notoSans(fontSize: 10, color: AppTheme.green), overflow: TextOverflow.ellipsis)),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
