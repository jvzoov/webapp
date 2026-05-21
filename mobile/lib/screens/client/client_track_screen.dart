// ============================================================
// QueuePe Mobile — Client Track Screen
// Live booking tracking with queue position, progress, check-in log
// ============================================================

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class ClientTrackScreen extends StatefulWidget {
  const ClientTrackScreen({super.key});

  @override
  State<ClientTrackScreen> createState() => _ClientTrackScreenState();
}

class _ClientTrackScreenState extends State<ClientTrackScreen> {
  int    _position   = 18;
  int    _progress   = 8;
  String _wait       = '2h 40m';
  int    _elapsedMin = 0;
  String _status     = 'ACTIVE';
  final List<Map<String, String>> _log = [
    {'time': '08:08', 'text': 'Rajan Kumar accepted the booking.'},
    {'time': '08:02', 'text': 'Booking confirmed and stander search started.'},
  ];

  void _simulate() {
    setState(() {
      _elapsedMin += 18;
      _position = (_position - 4).clamp(0, 100);
      _progress = (_progress + 18).clamp(0, 100);
      _wait = _position <= 2 ? '8m' : '1h 15m';
      final now = TimeOfDay.now();
      final timeStr = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
      if (_position <= 2) {
        _status = 'ALERT';
        _log.insert(0, {'time': timeStr, 'text': 'Your turn is near. Head to the queue now.'});
      } else {
        _log.insert(0, {'time': timeStr, 'text': 'Queue progressed — stander synced a fresh check-in.'});
      }
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Live queue updated'), backgroundColor: AppColors.ink),
    );
  }

  @override
  Widget build(BuildContext context) {
    final elapsed = '${(_elapsedMin ~/ 60).toString().padLeft(2, '0')}:${(_elapsedMin % 60).toString().padLeft(2, '0')}';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('LIVE BOOKING', style: AppText.sectionLabel),
          const SizedBox(height: 4),
          Text('Your Queue Status', style: AppText.sectionTitle),
          const SizedBox(height: 14),

          // Alert banner
          if (_position <= 2)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 14),
              decoration: BoxDecoration(
                color: AppColors.red,
                borderRadius: BorderRadius.circular(AppRadius.card),
              ),
              child: Column(
                children: [
                  Text('🔔 YOUR TURN IS NEAR!', style: AppText.display(24, color: Colors.white)),
                  const SizedBox(height: 4),
                  Text('Head to location now — 2 people ahead', style: AppText.body(13, color: Colors.white70)),
                ],
              ),
            ),

          // ─── Booking Card ─────────────────────────────
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border.all(color: AppColors.border, width: 1.5),
              borderRadius: BorderRadius.circular(AppRadius.card),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Accent bar
                Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: _status == 'ALERT' ? AppColors.red : AppColors.green,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.card)),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('RTO Office, Koramangala', style: AppText.cardTitle),
                          _StatusPill(_status),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Info row
                      Row(
                        children: [
                          _InfoCol('Queue Position', '$_position ahead'),
                          const SizedBox(width: 16),
                          _InfoCol('Est. Wait', _wait),
                          const SizedBox(width: 16),
                          _InfoCol('Time Elapsed', elapsed),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Progress bar
                      Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Progress', style: AppText.body(12, color: AppColors.ink3)),
                              Text('$_progress%', style: AppText.body(12, color: AppColors.ink3)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: _progress / 100,
                              minHeight: 8,
                              backgroundColor: AppColors.bg2,
                              valueColor: const AlwaysStoppedAnimation(AppColors.saffron),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Position big
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text('$_position', style: AppText.display(48, color: AppColors.saffron)),
                          const SizedBox(width: 6),
                          Text('people ahead', style: AppText.body(14, color: AppColors.ink3)),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Stander info
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.bg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 19,
                              backgroundColor: AppColors.ink,
                              child: Text('RK', style: AppText.display(18, color: Colors.white)),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('Rajan Kumar', style: AppText.body(14, weight: FontWeight.w600)),
                                  Text('★ 4.9 · 247 jobs completed', style: AppText.body(12, color: AppColors.ink3)),
                                  Container(
                                    margin: const EdgeInsets.only(top: 2),
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: AppColors.greenSoft,
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text('VERIFIED', style: AppText.mono(10, color: AppColors.green)),
                                  ),
                                ],
                              ),
                            ),
                            OutlinedButton(
                              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Calling Rajan...')),
                              ),
                              style: OutlinedButton.styleFrom(padding: const EdgeInsets.all(8)),
                              child: const Text('📞'),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Quick actions
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => context.go('/client/whatsapp'),
                              child: Text('OTP THREAD', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 13)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: OutlinedButton(
                              onPressed: () => context.push('/client/map'),
                              child: Text('MAP + ETA', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 13)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Check-in log
                      Text('CHECK-IN LOG', style: AppText.sectionLabel),
                      const SizedBox(height: 6),
                      Container(
                        constraints: const BoxConstraints(maxHeight: 140),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.bg,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: ListView(
                          shrinkWrap: true,
                          children: _log.map((l) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  width: 6, height: 6, margin: const EdgeInsets.only(top: 4),
                                  decoration: const BoxDecoration(
                                    color: AppColors.green,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(l['time']!, style: AppText.mono(12)),
                                const SizedBox(width: 8),
                                Expanded(child: Text(l['text']!, style: AppText.body(12, color: AppColors.ink2))),
                              ],
                            ),
                          )).toList(),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Simulate button
          ElevatedButton(
            onPressed: _simulate,
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.ink),
            child: Text('▶ SIMULATE LIVE UPDATES', style: AppText.buttonText),
          ),
          const SizedBox(height: 10),
          OutlinedButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Rating submitted')),
              );
              context.go('/client/history');
            },
            child: Text('COMPLETE & RATE', style: AppText.buttonText.copyWith(color: AppColors.ink)),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String status;
  const _StatusPill(this.status);

  @override
  Widget build(BuildContext context) {
    Color bg, fg;
    if (status == 'ALERT') {
      bg = AppColors.redSoft; fg = AppColors.red;
    } else if (status == 'ACTIVE') {
      bg = AppColors.greenSoft; fg = AppColors.green;
    } else {
      bg = AppColors.saffronSoft; fg = AppColors.saffron;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(4)),
      child: Text(status, style: AppText.mono(10, color: fg)),
    );
  }
}

class _InfoCol extends StatelessWidget {
  final String label;
  final String value;
  const _InfoCol(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppText.body(11, color: AppColors.ink3)),
          const SizedBox(height: 1),
          Text(value, style: AppText.body(14, weight: FontWeight.w500)),
        ],
      ),
    );
  }
}
