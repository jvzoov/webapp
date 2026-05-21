// QueuePe Mobile — Stander Home Screen
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme.dart';

class StanderHomeScreen extends StatefulWidget {
  const StanderHomeScreen({super.key});
  @override
  State<StanderHomeScreen> createState() => _StanderHomeScreenState();
}

class _StanderHomeScreenState extends State<StanderHomeScreen> {
  int _earnings = 0;
  int _jobs = 0;

  void _acceptJob() {
    setState(() {
      _earnings += 449;
      _jobs += 1;
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Job accepted')));
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        // Earnings Bar
        Container(
          padding: const EdgeInsets.all(16), decoration: BoxDecoration(color: AppColors.ink, borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('Today\'s Earnings', style: AppText.body(12, color: Colors.white54)),
              const SizedBox(height: 2), Text('₹$_earnings', style: AppText.display(32, color: AppColors.saffron)),
              Text('$_jobs jobs completed', style: AppText.mono(11, color: Colors.white38)),
            ]),
            Container(
              padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: AppColors.saffron, borderRadius: BorderRadius.circular(8)),
              child: Column(children: [Text('7', style: AppText.display(24, color: Colors.white)), Text('DAY STREAK', style: AppText.body(10, color: Colors.white70))]),
            ),
          ]),
        ),
        const SizedBox(height: 16),
        Text('AVAILABLE JOBS NEAR YOU', style: AppText.sectionLabel),
        const SizedBox(height: 10),
        // Job Card
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('RTO Office, Koramangala', style: AppText.cardTitle),
                Text('0.8 km away · Starts 8:00 AM', style: AppText.body(12, color: AppColors.ink3)),
              ]),
              Text('₹449', style: AppText.display(24, color: AppColors.ink)),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: _MetricBox('Estimated Hours', '2 hrs')), const SizedBox(width: 10),
              Expanded(child: _MetricBox('Queue Type', 'Licence renewal')),
            ]),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(8)),
              child: Row(children: [
                CircleAvatar(radius: 19, backgroundColor: AppColors.blue, child: Text('PS', style: AppText.display(18, color: Colors.white))),
                const SizedBox(width: 10),
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Priya Sharma', style: AppText.body(14, weight: FontWeight.w600)),
                  Text('+91 98765 43210', style: AppText.body(12, color: AppColors.ink3)),
                ]),
              ]),
            ),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: ElevatedButton(onPressed: _acceptJob, style: ElevatedButton.styleFrom(backgroundColor: AppColors.green), child: Text('ACCEPT', style: AppText.buttonText.copyWith(fontSize: 14)))),
              const SizedBox(width: 10),
              Expanded(child: OutlinedButton(onPressed: () => context.go('/stander/checkin'), child: Text('CHECK-IN', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 14)))),
            ]),
          ]),
        ),
        const SizedBox(height: 12),
        // Signup module
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text('STANDER SIGN UP', style: AppText.sectionLabel),
            const SizedBox(height: 4), Text('Signup available only via Aadhaar KYC / DigiLocker verification.', style: AppText.body(13, color: AppColors.ink2)),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: () => context.go('/stander/kyc'), child: Text('OPEN KYC FLOW', style: AppText.buttonText.copyWith(color: AppColors.ink))),
          ]),
        ),
      ]),
    );
  }
}

class _MetricBox extends StatelessWidget {
  final String label, value;
  const _MetricBox(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(label.toUpperCase(), style: AppText.formLabel), const SizedBox(height: 4), Text(value, style: AppText.body(14, weight: FontWeight.w600))]),
    );
  }
}
