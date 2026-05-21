// QueuePe Mobile — Stander KYC Screen
import 'package:flutter/material.dart';
import '../../core/theme.dart';

class StanderKycScreen extends StatefulWidget {
  const StanderKycScreen({super.key});
  @override
  State<StanderKycScreen> createState() => _StanderKycScreenState();
}

class _StanderKycScreenState extends State<StanderKycScreen> {
  int _step = 3;
  String _note = 'Standers can continue only after Aadhaar KYC and bank verification.';

  void _connect() {
    setState(() {
      _step = 4;
      _note = 'DigiLocker connected. Pulling Aadhaar identity attributes...';
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('DigiLocker connected')));
  }

  void _penny() {
    setState(() {
      _step = 6;
      _note = 'Bank penny-drop verified. Onboarding complete.';
    });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Penny-drop successful')));
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text('Aadhaar KYC / DigiLocker', style: AppText.sectionLabel),
        const SizedBox(height: 4), Text('Mandatory stander onboarding', style: AppText.sectionTitle),
        const SizedBox(height: 14),
        // Trust Score
        Container(
          padding: const EdgeInsets.all(16), decoration: BoxDecoration(gradient: const LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [AppColors.ink, Color(0xFF2b2520)]), borderRadius: BorderRadius.circular(14)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Trust score', style: AppText.mono(11, color: Colors.white60)),
            Text('86', style: AppText.display(54, color: AppColors.green)),
            const SizedBox(height: 8),
            Container(height: 10, decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(999)), child: FractionallySizedBox(widthFactor: 0.86, alignment: Alignment.centerLeft, child: Container(decoration: BoxDecoration(gradient: const LinearGradient(colors: [AppColors.green, Color(0xFF58c77e)]), borderRadius: BorderRadius.circular(999))))),
          ]),
        ),
        const SizedBox(height: 12),
        // Stepper
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            Text('5-STEP VERIFICATION CHECKLIST', style: AppText.sectionLabel),
            const SizedBox(height: 14),
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              _Step(1, 'Aadhaar consent', _step), _Step(2, 'OTP auth', _step), _Step(3, 'DigiLocker fetch', _step), _Step(4, 'Penny drop', _step), _Step(5, 'Face match', _step),
            ]),
            const SizedBox(height: 18),
            Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.amberSoft, borderRadius: BorderRadius.circular(8)), child: Text(_note, style: AppText.body(13, color: AppColors.ink2))),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: ElevatedButton(onPressed: _connect, child: Text('DIGILOCKER', style: AppText.buttonText.copyWith(fontSize: 14)))),
              const SizedBox(width: 10),
              Expanded(child: OutlinedButton(onPressed: _penny, child: Text('PENNY-DROP', style: AppText.buttonText.copyWith(color: AppColors.ink, fontSize: 14)))),
            ]),
          ]),
        ),
        const SizedBox(height: 12),
        // Grid
        Container(
          padding: const EdgeInsets.all(18), decoration: BoxDecoration(color: AppColors.surface, border: Border.all(color: AppColors.border, width: 1.5), borderRadius: BorderRadius.circular(AppRadius.card)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('6-METRIC TRUST SCORE GRID', style: AppText.sectionLabel),
            const SizedBox(height: 10),
            GridView.count(shrinkWrap: true, physics: const NeverScrollableScrollPhysics(), crossAxisCount: 2, mainAxisSpacing: 10, crossAxisSpacing: 10, childAspectRatio: 2.0, children: [
              _GridBox('Aadhaar match', '99%'), _GridBox('Checklist', '4/5'), _GridBox('Penny-drop', '₹1'), _GridBox('Avg time', '2m'), _GridBox('Fraud risk', 'Low'), _GridBox('Session', 'Live'),
            ]),
          ]),
        ),
      ]),
    );
  }
}

class _Step extends StatelessWidget {
  final int num; final String label; final int current;
  const _Step(this.num, this.label, this.current);
  @override
  Widget build(BuildContext context) {
    final isDone = num < current; final isActive = num == current;
    final color = isDone ? AppColors.green : (isActive ? AppColors.saffron : AppColors.ink3);
    final bg = isDone ? AppColors.greenSoft : (isActive ? AppColors.saffronSoft : AppColors.bg2);
    return Expanded(
      child: Column(children: [
        Container(width: 28, height: 28, decoration: BoxDecoration(color: bg, border: Border.all(color: isDone ? color : AppColors.border2, width: 2), shape: BoxShape.circle), child: Center(child: Text(isDone ? '✓' : num.toString(), style: AppText.mono(11, color: color)))),
        const SizedBox(height: 6), Text(label, textAlign: TextAlign.center, style: AppText.mono(10, color: AppColors.ink3).copyWith(height: 1.3)),
      ]),
    );
  }
}

class _GridBox extends StatelessWidget {
  final String label, value;
  const _GridBox(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [Text(label.toUpperCase(), style: AppText.formLabel), const SizedBox(height: 4), Text(value, style: AppText.body(14, weight: FontWeight.w600))]));
  }
}
