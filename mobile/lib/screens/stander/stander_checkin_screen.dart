// QueuePe Mobile — Stander Checkin Screen
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class StanderCheckinScreen extends StatefulWidget {
  const StanderCheckinScreen({super.key});
  @override
  State<StanderCheckinScreen> createState() => _StanderCheckinScreenState();
}

class _StanderCheckinScreenState extends State<StanderCheckinScreen> {
  bool _verified = false;
  bool _notified = false;

  void _verify() {
    setState(() => _verified = true);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Check-in verified')));
  }

  void _notify() {
    setState(() => _notified = true);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Client notified')));
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text('Geo Check-in & Selfie', style: AppText.sectionTitle),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: _verified ? AppColors.greenSoft : AppColors.surface,
            border: Border.all(color: _verified ? AppColors.green : AppColors.border, width: 1.5),
            borderRadius: BorderRadius.circular(AppRadius.card),
          ),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Row(children: [
              CircleAvatar(radius: 19, backgroundColor: AppColors.ink, child: const Text('📍', style: TextStyle(fontSize: 18))),
              const SizedBox(width: 10),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('GPS status', style: AppText.body(14, weight: FontWeight.w600)),
                Text(_verified ? 'GPS verified and selfie proof synced at queue perimeter.' : 'Waiting to verify live queue location...', style: AppText.body(12, color: AppColors.ink3)),
              ])),
            ]),
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.bg, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('SELFIE PROOF', style: AppText.formLabel), const SizedBox(height: 4),
                Text('Tap the button below to simulate a queue-side selfie capture.', style: AppText.body(13, color: AppColors.ink2)),
              ]),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: ElevatedButton(onPressed: _verify, child: Text('VERIFY', style: AppText.buttonText.copyWith(fontSize: 14)))),
              const SizedBox(width: 10),
              Expanded(child: OutlinedButton(onPressed: () => context.go('/stander/geofence'), child: Text('GEO-FENCE', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 14)))),
            ]),
          ]),
        ),
        const SizedBox(height: 12),
        ElevatedButton(
          onPressed: _notified ? null : _notify,
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.ink, disabledBackgroundColor: AppColors.ink3),
          child: Text(_notified ? 'CLIENT NOTIFIED' : 'NOTIFY CLIENT → TURN NEAR', style: AppText.buttonText.copyWith(fontSize: 16)),
        ),
        const SizedBox(height: 12),
        OutlinedButton(onPressed: () => context.go('/stander/wallet'), child: Text('VIEW WALLET', style: AppText.buttonText.copyWith(color: AppColors.ink))),
      ]),
    );
  }
}
