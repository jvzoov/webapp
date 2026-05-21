// ============================================================
// QueuePe Mobile — Client Home Screen
// Hero band + Location grid + Book button
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';
import '../../widgets/location_chip.dart';

class ClientHomeScreen extends StatefulWidget {
  const ClientHomeScreen({super.key});

  @override
  State<ClientHomeScreen> createState() => _ClientHomeScreenState();
}

class _ClientHomeScreenState extends State<ClientHomeScreen> {
  String? _selectedLocation;

  static const _locations = [
    {'icon': '🚗', 'name': 'RTO Office',         'wait': 'Avg wait: 3–5 hrs', 'standers': '12 standers nearby'},
    {'icon': '🛂', 'name': 'Passport Seva',       'wait': 'Avg wait: 2–4 hrs', 'standers': '8 standers nearby'},
    {'icon': '🏥', 'name': 'Govt Hospital',       'wait': 'Avg wait: 4–6 hrs', 'standers': '19 standers nearby'},
    {'icon': '🏦', 'name': 'Bank / Post Office',  'wait': 'Avg wait: 1–2 hrs', 'standers': '6 standers nearby'},
    {'icon': '⚖️', 'name': 'RERA / Court',        'wait': 'Avg wait: 2–3 hrs', 'standers': '5 standers nearby'},
    {'icon': '📍', 'name': 'Other',               'wait': 'Any queue',         'standers': 'Depends on area'},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ─── Hero Band ──────────────────────────────────
          _buildHeroBand(),

          // ─── Location Grid Section ──────────────────────
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CHOOSE LOCATION TYPE',
                  style: AppText.sectionLabel,
                ),
                const SizedBox(height: 10),

                // 2-column grid
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 1.35,
                  ),
                  itemCount: _locations.length,
                  itemBuilder: (context, i) {
                    final loc = _locations[i];
                    final isSelected = _selectedLocation == loc['name'];
                    return LocationChip(
                      icon: loc['icon']!,
                      name: loc['name']!,
                      wait: loc['wait']!,
                      standers: loc['standers']!,
                      isSelected: isSelected,
                      onTap: () {
                        setState(() => _selectedLocation = loc['name']);
                      },
                    );
                  },
                ),

                const SizedBox(height: 20),

                // Book button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.go('/client/book'),
                    child: Text(
                      'BOOK A STANDER →',
                      style: AppText.buttonText,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroBand() {
    return Container(
      color: AppColors.ink,
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "INDIA'S QUEUE PROBLEM, SOLVED",
            style: AppText.mono(10, color: AppColors.saffron)
                .copyWith(letterSpacing: 1.2),
          ),
          const SizedBox(height: 6),
          RichText(
            text: TextSpan(
              style: AppText.display(48, color: Colors.white),
              children: const [
                TextSpan(text: 'Skip The\n'),
                TextSpan(
                  text: 'Line.',
                  style: TextStyle(color: AppColors.saffron),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'We send a verified Stander to hold your spot at any RTO, hospital, bank or government office — while you carry on with your day.',
            style: AppText.body(13, color: Colors.white60, height: 1.6),
          ),
          const SizedBox(height: 16),

          // Stats row
          Row(
            children: [
              _HeroStat(value: '₹150', label: 'starts at / hr'),
              const SizedBox(width: 16),
              _HeroStat(value: '15min', label: 'avg match time'),
              const SizedBox(width: 16),
              _HeroStat(value: '4.8★', label: 'avg stander rating'),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  final String value;
  final String label;
  const _HeroStat({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: AppText.display(22, color: AppColors.saffron)),
        const SizedBox(height: 2),
        Text(
          label.toUpperCase(),
          style: AppText.mono(9, color: Colors.white38)
              .copyWith(letterSpacing: 0.6),
        ),
      ],
    );
  }
}
