// QueuePe Mobile — Stander Wallet Screen
import 'package:flutter/material.dart';
import '../../core/theme.dart';

class StanderWalletScreen extends StatelessWidget {
  const StanderWalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text('Wallet & Earnings', style: AppText.sectionTitle),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            _BalRow('Available balance:', '₹1,240'),
            _BalRow('Today settled:', '₹860'),
            _BalRow('Pending release:', '₹380'),
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Payout request created'))),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.green),
              child: Text('WITHDRAW PAYOUT', style: AppText.buttonText),
            ),
          ]),
        ),
      ]),
    );
  }
}

class _BalRow extends StatelessWidget {
  final String label, amt;
  const _BalRow(this.label, this.amt);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(width: 6, height: 6, margin: const EdgeInsets.only(top: 8), decoration: const BoxDecoration(color: AppColors.green, shape: BoxShape.circle)),
        const SizedBox(width: 8),
        Expanded(child: RichText(text: TextSpan(style: AppText.body(15, color: AppColors.ink2), children: [TextSpan(text: '$label ', style: const TextStyle(fontWeight: FontWeight.bold)), TextSpan(text: amt)]))),
      ]),
    );
  }
}
